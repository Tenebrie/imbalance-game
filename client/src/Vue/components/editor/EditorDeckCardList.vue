<template>
	<div class="editor-deck-card-list">
		<div class="card-list" v-if="deck">
			<input type="text" v-model="deckName" placeholder="New deck" />
			<editor-deck-card-list-separator :color="CardColor.LEADER" />
			<editor-deck-card-list-item :card="card" v-for="card in leaderCards" :key="card.id" />
			<editor-deck-card-list-separator :color="CardColor.GOLDEN" />
			<editor-deck-card-list-item :card="card" v-for="card in goldenCards" :key="card.id" />
			<editor-deck-card-list-separator :color="CardColor.SILVER" />
			<editor-deck-card-list-item :card="card" v-for="card in silverCards" :key="card.id" />
			<editor-deck-card-list-separator :color="CardColor.BRONZE" />
			<editor-deck-card-list-item :card="card" v-for="card in bronzeCards" :key="card.id" />
		</div>
		<div class="buttons">
			<editor-save-deck-button />
			<editor-delete-deck-button />
			<router-link class="link button-link" tag="span" :to="{ name: 'decks' }">Back</router-link>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import CardColor from '@shared/enums/CardColor'
import PopulatedEditorDeck from '@/utils/editor/PopulatedEditorDeck'
import EditorDeckCardListItem from '@/Vue/components/editor/EditorDeckCardListItem.vue'
import EditorDeckCardListSeparator from '@/Vue/components/editor/EditorDeckCardListSeparator.vue'
import PopulatedEditorCard from '@shared/models/PopulatedEditorCard'
import EditorSaveDeckButton from '@/Vue/components/editor/buttons/EditorSaveDeckButton.vue'
import EditorDeleteDeckButton from '@/Vue/components/editor/buttons/EditorDeleteDeckButton.vue'

export default Vue.extend({
	components: {
		EditorSaveDeckButton,
		EditorDeleteDeckButton,
		EditorDeckCardListItem,
		EditorDeckCardListSeparator,
	},

	data: () => ({
		CardColor: CardColor
	}),

	computed: {
		deckId(): string {
			return this.$route.params.id
		},

		deck(): PopulatedEditorDeck {
			return store.state.editor.decks.find(deck => deck.id === this.deckId)
		},

		deckName: {
			get(): string {
				return this.deck.name
			},
			set(name: string): void {
				const deckId = this.$route.params.id
				store.dispatch.editor.renameDeck({ deckId, name })
			}
		},

		leaderCards(): PopulatedEditorCard[] {
			return this.deck.cards.filter(card => card.color === CardColor.LEADER)
		},

		goldenCards(): PopulatedEditorCard[] {
			return this.deck.cards.filter(card => card.color === CardColor.GOLDEN)
		},

		silverCards(): PopulatedEditorCard[] {
			return this.deck.cards.filter(card => card.color === CardColor.SILVER)
		},

		bronzeCards(): PopulatedEditorCard[] {
			return this.deck.cards.filter(card => card.color === CardColor.BRONZE)
		}
	},

	created(): void {
		store.dispatch.editor.loadDecks()
		store.commit.editor.setCurrentDeckId(this.deckId)
	},

	beforeDestroy(): void {
		store.commit.editor.setCurrentDeckId(null)
	},

	methods: {

	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.editor-deck-card-list {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 8px 8px 0 8px;
		width: 100%;
		height: 100%;
		input[type="text"] {
			font-size: 1.4em;
			font-family: 'Roboto', sans-serif;
			background: none;
			text-align: center;
		}

		.card-list {
			width: 100%;
			display: flex;
			flex-direction: column;
			overflow-y: auto;
		}

		.buttons {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
		}
	}
</style>
