<template>
	<div class="the-deck-card-list">
		<div class="card-list" v-if="deck">
			<the-deck-card-list-item :card="card" v-for="card in deck.cards" :key="card.id" />
		</div>
		<div class="buttons">
			<span class="link" @click="onSave">Save</span>
			<router-link class="link" tag="span" :to="{ name: 'decks' }">Back</router-link>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import EditorDeck from '@shared/models/EditorDeck'
import TheDeckCardListItem from '@/Vue/components/editor/TheDeckCardListItem.vue'

export default Vue.extend({
	components: {
		TheDeckCardListItem
	},

	computed: {
		deckId(): string {
			return this.$route.params.id
		},

		deck(): EditorDeck {
			return store.state.editor.decks.find(deck => deck.id === this.deckId)
		}
	},

	created(): void {
		store.dispatch.editor.loadDecks()
	},

	methods: {
		onSave(): void {
			const deckId = this.$route.params.id
			store.dispatch.editor.saveDeck({ deckId })
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-deck-card-list {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 8px 8px 0 8px;
		width: 100%;
		height: 100%;
		.card-list {
			width: 100%;
			display: flex;
			flex-direction: column;
		}

		.buttons {
			display: flex;
			flex-direction: row;
			justify-content: space-between;

			.link {
				font-size: 1.4em;
				padding: 16px 8px;
				width: calc(100% - 16px);
				cursor: pointer;
				user-select: none;
				&:hover {
					background: $COLOR-BACKGROUND-TRANSPARENT;
				}
			}
		}
	}
</style>
