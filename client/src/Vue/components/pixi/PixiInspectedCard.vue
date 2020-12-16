<template>
	<div class="the-editor-inspected-card"
		 v-if="inspectedCard"
		 @click="onSmokeScreenClick"
		 @mouseup="onSmokeScreenRightClick"
		 :class="customClass"
	>
		<div class="content">
			<div class="card-container">
				<div class="card" :key="(preRenderedCard && preRenderedCard.class) || ''">
					<pixi-pre-rendered-card :card="preRenderedCard" />
				</div>
			</div>
			<div class="overlay-container">
				<pixi-inspected-card-info />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import PixiPreRenderedCard from '@/Vue/components/pixi/PixiPreRenderedCard.vue'
import PixiInspectedCardInfo from '@/Vue/components/pixi/PixiInspectedCardInfo.vue'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardMessage from '@shared/models/network/card/CardMessage'
import {computed, defineComponent} from '@vue/composition-api'
import {RIGHT_MOUSE_BUTTON} from '@/Pixi/input/Input'

export default defineComponent({
	components: {
		PixiPreRenderedCard,
		PixiInspectedCardInfo
	},

	setup() {
		const preRenderedCard = computed<CardMessage | null>(() => {
			const card = store.getters.inspectedCard.card
			if (card instanceof RenderedCard) {
				return null
			}
			return card as CardMessage
		})

		const inspectedCard = computed<CardMessage | RenderedCard | null>(() => {
			return store.getters.inspectedCard.card as CardMessage
		})

		const customClass = computed<Record<string, boolean>>(() => ({
			'game': store.getters.gameStateModule.isInGame,
			'editor': !store.getters.gameStateModule.isInGame,
		}))

		const onSmokeScreenClick = () => {
			store.dispatch.inspectedCard.undoCard()
		}

		const onSmokeScreenRightClick = (event: MouseEvent) => {
			if (event.button === RIGHT_MOUSE_BUTTON && !store.getters.gameStateModule.isInGame && !event.shiftKey && !event.ctrlKey) {
				onSmokeScreenClick()
			}
		}

		return {
			inspectedCard,
			preRenderedCard,
			customClass,
			onSmokeScreenClick,
			onSmokeScreenRightClick,
		}
	},
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-editor-inspected-card {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		left: 0;
		width: 100%;

		&.game {
			height: 100%;
			pointer-events: none;
		}

		&.editor {
			height: calc(100% - #{$NAVIGATION-BAR-HEIGHT});
			background: rgba(black, 0.5);
		}

		.content {
			display: flex;
			max-width: 100%;

			.card-container {
				display: flex;
				justify-content: flex-end;
				width: $INSPECTED-CARD-INFO-WINDOW-WIDTH;
				.card {
					position: relative;
					width: calc(#{$CARD_WIDTH});
					height: calc(#{$CARD_HEIGHT});
					flex-grow: 0;
					flex-shrink: 0;
				}
			}

			.overlay-container {
				position: relative;
				margin: 0;
				flex-grow: 0;
				flex-shrink: 0;
				width: $INSPECTED-CARD-INFO-WINDOW-WIDTH;
			}

			@media (max-width: calc(#{$INSPECTED-CARD-INFO-WINDOW-WIDTH} * 2 + 24px)) {
				.card-container {
					max-width: calc(#{$INSPECTED-CARD-INFO-WINDOW-WIDTH} / 2 + 24px);
				}

				.overlay-container {
					max-width: calc(#{$INSPECTED-CARD-INFO-WINDOW-WIDTH} / 2 + 24px);
				}
			}

			@media (max-width: calc(#{$INSPECTED-CARD-INFO-WINDOW-WIDTH} + 24px)) {
				.card-container {
					max-width: calc(#{$INSPECTED-CARD-INFO-WINDOW-WIDTH} / 4 + 24px);
					.card {
						width: calc(#{$CARD_WIDTH} / 1.5);
						height: calc(#{$CARD_HEIGHT} / 1.5);
					}
				}

				.overlay-container {
					max-width: calc(#{$INSPECTED-CARD-INFO-WINDOW-WIDTH} / 4 + 24px);
				}
			}
		}
	}
</style>
