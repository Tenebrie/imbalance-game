<template>
	<div class="the-editor-inspected-card" v-if="inspectedCard">
		<div class="overlay-container" :style="overlayPosition">
			<pixi-inspected-card-overlay />
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import Card from '@shared/models/Card'
import PixiInspectedCardOverlay from '@/Vue/components/pixi/PixiInspectedCardOverlay.vue'

export default Vue.extend({
	components: {
		PixiInspectedCardOverlay
	},

	computed: {
		inspectedCard(): Card | null {
			return store.getters.editor.inspectedCard.card
		},

		overlayPosition() {
			return {
				left: `${store.state.editor.inspectedCard.position.x}px`,
				top: `${store.state.editor.inspectedCard.position.y}px`,
			}
		}
	},

	methods: {
		onClick(): void {
			store.commit.editor.inspectedCard.setCard(null)
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-editor-inspected-card {
		position: absolute;
		width: 100%;
		height: 100%;
		padding: 0 16px;
		pointer-events: none;
		display: flex;
		align-items: flex-start;
		justify-content: flex-start;

		.overlay-container {
			position: absolute;
			width: 100%;
			height: 100%;
			display: flex;
			align-items: flex-start;
			justify-content: flex-start;
		}
	}
</style>
