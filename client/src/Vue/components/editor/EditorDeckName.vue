<template>
	<div class="editor-deck-name">
		<input type="text" v-model="deckName" placeholder="New deck" />
		<span class="edit-icon"><i class="fas fa-pen"></i></span>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import PopulatedEditorDeck from '@/utils/editor/PopulatedEditorDeck'
import { defineComponent } from 'vue'

export default defineComponent({
	computed: {
		deckId(): string {
			const id = this.$route.params.deckId
			if (id instanceof Array) {
				return id[0]
			}
			return id
		},

		deck(): PopulatedEditorDeck {
			return store.state.editor.decks.find((deck) => deck.id === this.deckId)!
		},

		deckName: {
			get(): string {
				return this.deck.name
			},
			set(name: string): void {
				store.dispatch.editor.renameDeck({ deckId: this.deckId, name })
			},
		},
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.editor-deck-name {
	position: relative;

	input[type='text'] {
		display: block;
		font-size: 1.4em;
		font-family: 'Roboto', sans-serif;
		background: none;
		text-align: center;
		width: calc(100% - 32px);
		margin: 0 8px;

		&:hover,
		&:focus {
			background: rgba(white, 0.1);
		}
	}

	.edit-icon {
		position: absolute;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		top: 0;
		right: 16px;
		opacity: 0.5;
	}
}
</style>
