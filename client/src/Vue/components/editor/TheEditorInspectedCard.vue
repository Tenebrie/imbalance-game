<template>
	<div class="the-editor-inspected-card"
		 v-if="inspectedCard"
		 @click="onSmokeScreenClick"
		 @contextmenu="onSmokeScreenClick"
	>
		<div class="content">
			<div class="card-container">
				<div class="card">
					<pixi-pre-rendered-card :card="inspectedCard" />
				</div>
			</div>
			<div class="overlay-container">
				<pixi-inspected-card-overlay @click="onOverlayClick" />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import Card from '@shared/models/Card'
import PixiInspectedCardOverlay from '@/Vue/components/pixi/PixiInspectedCardOverlay.vue'
import PixiPreRenderedCard from '@/Vue/components/pixi/PixiPreRenderedCard.vue'

export default Vue.extend({
	components: {
		PixiPreRenderedCard,
		PixiInspectedCardOverlay
	},

	computed: {
		inspectedCard(): Card | null {
			return store.getters.editor.inspectedCard.card
		},
	},

	methods: {
		onSmokeScreenClick(): void {
			store.dispatch.editor.inspectedCard.undoCard()
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
		background: rgba(black, 0.5);
		border-radius: 16px;
		width: calc(100% - 64px);
		height: calc(100% - #{$CARD_LIBRARY_NAVIGATION_BAR_HEIGHT} - #{$CARD_LIBRARY_NAVIGATION_BAR_MARGIN_BOTTOM});
		padding: 0 16px;
		display: flex;
		align-items: center;
		justify-content: center;

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
