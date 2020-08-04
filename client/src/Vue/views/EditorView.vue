<template>
	<div class="editor-view">
		<div class="card-library">
			<the-card-library />
		</div>
		<div class="deck-list">
			<router-view />
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import TheCardLibrary from '@/Vue/components/editor/TheCardLibrary.vue'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import { editorCardRenderer } from '@/utils/editor/EditorCardRenderer'

export default Vue.extend({
	components: { TheCardLibrary },

	computed: {

	},

	mounted(): void {
		setTimeout(() => {
			TextureAtlas.preloadComponents()
		}, 500)
		store.dispatch.editor.loadCardLibrary()
		editorCardRenderer.startRenderingService()
	},

	beforeDestroy(): void {
		editorCardRenderer.stopRenderingService()
	},

	methods: {

	}
})
</script>

<style scoped lang="scss">
	@import "../styles/generic";

	.editor-view {
		display: flex;
		align-items: flex-end;
		justify-content: center;

		& > div {
			height: 100%;
			background: $COLOR-BACKGROUND-TRANSPARENT;
		}

		.card-library {
			flex: 1;
			margin: 0 16px 0 32px;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
		}

		$DECK-LIST-WIDTH: 410px;
		.deck-list {
			max-width: $DECK-LIST-WIDTH;
			flex-grow: 0;
			flex-shrink: 0;
			margin: 0 32px 0 16px;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;

			@media screen and (max-width: calc(#{$DECK-LIST-WIDTH} * 2)) {
				max-width: 50%;
			}
		}
	}
</style>
