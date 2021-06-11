<template>
	<div class="the-editor-hovered-deck-card" :style="overlayPosition" ref="overlayRef">
		<pixi-pre-rendered-card class="card" :key="hoveredDeckCard && hoveredDeckCard.class" :card="hoveredDeckCard" />
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import * as PIXI from 'pixi.js'
import { computed, defineComponent, ref } from 'vue'
import PixiPreRenderedCard from '@/Vue/components/pixi/PixiPreRenderedCard.vue'
import CardMessage from '@shared/models/network/card/CardMessage'

export default defineComponent({
	components: {
		PixiPreRenderedCard,
	},

	setup() {
		const overlayRef = ref<HTMLDivElement>()

		const overlayPosition = computed(() => {
			return {
				top: `calc(${store.state.editor.hoveredDeckCard.position.y}px - ${584 / 3}px + ${editorModeOffset.value.y}px)`,
			}
		})

		const editorModeOffset = computed<PIXI.Point>(() => {
			const offset = new PIXI.Point(0, 0)

			if (overlayRef.value) {
				const topClipping = store.state.editor.hoveredDeckCard.position.y - overlayRef.value.clientHeight / 2 - 4
				if (topClipping < 0) {
					offset.y = -topClipping
				}

				const bottomClipping = window.innerHeight - (store.state.editor.hoveredDeckCard.position.y + overlayRef.value.clientHeight / 2 + 48)
				if (bottomClipping < 0) {
					offset.y = bottomClipping
				}
			}
			return offset
		})

		const hoveredDeckCard = computed<CardMessage | null>(() => store.getters.editor.hoveredDeckCard.card)

		return {
			overlayRef,
			overlayPosition,
			editorModeOffset,
			hoveredDeckCard,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.the-editor-hovered-deck-card {
	position: absolute;
	pointer-events: none;
	display: flex;
	justify-content: center;
	width: calc(#{$CARD_WIDTH} / 1.5);
	height: calc(#{$CARD_HEIGHT} / 1.5);
	left: 100%;
	margin-top: -3px;
	z-index: 1;

	.card {
		display: flex;
		width: 100%;
		height: 100%;
	}
}
</style>
