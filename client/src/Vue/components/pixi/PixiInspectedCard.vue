<template>
	<div
		class="the-editor-inspected-card"
		@click="onSmokeScreenClick"
		@mousedown="onSmokeScreenRightClickDown"
		@mouseup="onSmokeScreenRightClickUp"
		:class="customClass"
	>
		<div class="content">
			<div class="card-container">
				<div class="card" :key="inspectedCardKey">
					<pixi-pre-rendered-card :card="inspectedCard" />
				</div>
			</div>
			<div class="overlay-container">
				<pixi-inspected-card-info />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import CardMessage from '@shared/models/network/card/CardMessage'
import { computed, defineComponent, ref } from 'vue'

import { RIGHT_MOUSE_BUTTON } from '@/Pixi/input/Input'
import { getCardMessageKey } from '@/utils/Utils'
import PixiInspectedCardInfo from '@/Vue/components/pixi/inspectedCardInfo/PixiInspectedCardInfo.vue'
import PixiPreRenderedCard from '@/Vue/components/pixi/PixiPreRenderedCard.vue'
import store from '@/Vue/store'
import InspectedCardStore from '@/Vue/store/InspectedCardStore'

export default defineComponent({
	components: {
		PixiPreRenderedCard,
		PixiInspectedCardInfo,
	},

	setup() {
		const inspectedCard = computed<CardMessage | null>(() => {
			return InspectedCardStore.getters.card || InspectedCardStore.getters.lastCard
		})

		const inspectedCardKey = computed<string>(() => {
			const card = inspectedCard.value
			return card ? getCardMessageKey(card) : ''
		})

		const customClass = computed<Record<string, boolean>>(() => ({
			game: store.getters.gameStateModule.isInGame,
			editor: !store.getters.gameStateModule.isInGame,
			displayed: !!InspectedCardStore.getters.card,
		}))

		const onSmokeScreenClick = () => {
			InspectedCardStore.dispatch.undoCard()
		}

		const isRightMouseDown = ref<boolean>(false)
		const onSmokeScreenRightClickDown = (event: MouseEvent) => {
			if (event.button === RIGHT_MOUSE_BUTTON && !event.ctrlKey) {
				isRightMouseDown.value = true
			}
		}

		const onSmokeScreenRightClickUp = (event: MouseEvent) => {
			if (event.button === RIGHT_MOUSE_BUTTON && isRightMouseDown.value) {
				onSmokeScreenClick()
			}
			isRightMouseDown.value = false
		}

		return {
			inspectedCard,
			inspectedCardKey,
			customClass,
			onSmokeScreenClick,
			onSmokeScreenRightClickDown,
			onSmokeScreenRightClickUp,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.the-editor-inspected-card {
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	left: 0;
	width: 100%;
	z-index: 1000;
	background: rgba(black, 0.75);
	opacity: 0;
	pointer-events: none;
	transition: opacity 0.3s;

	@supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
		background: rgba(black, 0.5);
		backdrop-filter: blur(4px);
	}

	&.displayed {
		opacity: 1;
		pointer-events: auto;
		transition: opacity 0.15s;
	}

	&.game {
		height: 100%;
	}

	&.editor {
		height: calc(100% - #{$NAVIGATION-BAR-HEIGHT});
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
