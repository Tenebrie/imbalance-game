<template>
	<div class="the-editor-inspected-card"
		 v-if="inspectedCard"
		 @click="onSmokeScreenClick"
		 @contextmenu="onSmokeScreenRightClick"
		 :class="customClass"
	>
		<div class="content">
			<div class="card-container">
				<div class="card" :key="(preRenderedCard && preRenderedCard.class) || ''">
					<pixi-pre-rendered-card :card="preRenderedCard" />
				</div>
			</div>
			<div class="overlay-container">
				<pixi-inspected-card-info @click="onOverlayClick" />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import PixiPreRenderedCard from '@/Vue/components/pixi/PixiPreRenderedCard.vue'
import PixiInspectedCardInfo from '@/Vue/components/pixi/PixiInspectedCardInfo.vue'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardMessage from '@shared/models/network/card/CardMessage'

export default Vue.extend({
	components: {
		PixiPreRenderedCard,
		PixiInspectedCardInfo
	},

	computed: {
		preRenderedCard(): CardMessage | null {
			const card = store.getters.inspectedCard.card
			if (card instanceof RenderedCard) {
				return null
			}
			return card
		},

		inspectedCard(): CardMessage | RenderedCard | null {
			return store.getters.inspectedCard.card
		},

		customClass(): {} {
			return {
				'game': store.getters.gameStateModule.isInGame,
				'editor': !store.getters.gameStateModule.isInGame,
			}
		}
	},

	methods: {
		onSmokeScreenClick(): void {
			store.dispatch.inspectedCard.undoCard()
		},

		onSmokeScreenRightClick(event: MouseEvent): void {
			if (!store.getters.gameStateModule.isInGame && !event.shiftKey && !event.ctrlKey) {
				this.onSmokeScreenClick()
			}
		},

		onOverlayClick(event: MouseEvent): void {
			event.cancelBubble = true
			if (!event.ctrlKey && !event.shiftKey) {
				event.preventDefault()
			}
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-editor-inspected-card {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;

		&.game {
			width: calc(100%);
			height: calc(100%);
			pointer-events: none;
		}

		&.editor {
			width: calc(100% - 64px);
			height: calc(100% - #{$CARD_LIBRARY_NAVIGATION_BAR_HEIGHT} - #{$CARD_LIBRARY_NAVIGATION_BAR_MARGIN_BOTTOM});
			padding: 0 16px;
			border-radius: 16px;
			background: rgba(black, 0.5);
		}

		.content {
			display: flex;

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
		}
	}
</style>
