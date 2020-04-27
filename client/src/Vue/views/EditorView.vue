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
import axios from 'axios'
import CardMessage from '@shared/models/network/CardMessage'
import { editorCardRenderer } from '@/Vue/components/editor/EditorCardRenderer'
import Utils from '@/utils/Utils'

export default Vue.extend({
	components: { TheCardLibrary },

	computed: {

	},

	mounted(): void {
		setTimeout(() => {
			TextureAtlas.prepare()
			this.loadCardLibrary()
		}, 500)

		setInterval(() => {
			const nextCard = store.state.editor.renderQueue[0]
			if (!nextCard) {
				return
			}

			store.commit.editor.shiftRenderQueue()
			store.commit.editor.addRenderedCard({
				id: nextCard.id,
				render: editorCardRenderer.render(nextCard)
			})
		}, 0)
	},

	methods: {
		async loadCardLibrary(): Promise<void> {
			const response = await axios.get('/api/cards', { params: { onlyPlayable: true } })
			const cardMessages = response.data as CardMessage[]
			const sortedMessages = Utils.sortEditorCards(cardMessages)
			store.commit.editor.setCardLibrary(sortedMessages)
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../styles/generic";

	.editor-view {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;

		& > div {
			height: 75%;
			background: $COLOR-BACKGROUND-TRANSPARENT;
		}

		.card-library {
			flex: 3;
			margin: 32px 16px 32px 32px;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
		}

		.deck-list {
			flex: 1;
			margin: 32px 32px 32px 16px;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
		}
	}
</style>
