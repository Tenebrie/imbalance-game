<template>
	<div class="the-editor-hovered-deck-card" :style="this.overlayPosition" ref="overlayRef">
		<pixi-pre-rendered-card
				class="card"
				:key="this.hoveredDeckCard && this.hoveredDeckCard.class"
				:card="this.hoveredDeckCard"
				:vertical-offset="this.editorModeOffset.y"
		/>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import * as PIXI from 'pixi.js'
import {computed, ref} from '@vue/composition-api'
import PixiPreRenderedCard from '@/Vue/components/pixi/PixiPreRenderedCard.vue'
import CardMessage from '@shared/models/network/CardMessage'

export default {
	components: {
		PixiPreRenderedCard
	},

	setup() {
		const overlayRef = ref<HTMLDivElement>()

		const overlayPosition = computed(() => {
			return {
				top: `calc(${store.state.editor.hoveredDeckCard.position.y}px - 48px)`,
			}
		})

		const editorModeOffset = computed<PIXI.Point>(() => {
			const offset = new PIXI.Point(0, 0)

			if (overlayRef.value) {
				offset.set(
					Math.min(0, window.innerWidth - overlayRef.value.offsetLeft),
					Math.min(window.innerHeight - store.state.editor.hoveredDeckCard.position.y - overlayRef.value.clientHeight, 0)
				)
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
}
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-editor-hovered-deck-card {
		position: absolute;
		pointer-events: none;
		display: flex;
		justify-content: center;
		width: calc(#{$CARD_WIDTH} / 2);
		height: calc(#{$CARD_HEIGHT} / 2);
		right: 100%;
		margin-top: -4px;

		.card {
			display: flex;
			width: 100%;
			height: 100%;
		}
	}
</style>
