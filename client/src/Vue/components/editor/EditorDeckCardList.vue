<template>
	<div class="editor-deck-card-list">
		<div class="card-list" v-if="deck" @scroll="onScroll">
			<editor-deck-name />
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
			<editor-export-deck-button />
			<editor-delete-deck-button />
			<editor-leave-deck-button />
		</div>
		<the-editor-hovered-deck-card />
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
import EditorDeckName from '@/Vue/components/editor/EditorDeckName.vue'
import EditorSaveDeckButton from '@/Vue/components/editor/buttons/EditorSaveDeckButton.vue'
import EditorExportDeckButton from '@/Vue/components/editor/buttons/EditorExportDeckButton.vue'
import EditorDeleteDeckButton from '@/Vue/components/editor/buttons/EditorDeleteDeckButton.vue'
import EditorLeaveDeckButton from '@/Vue/components/editor/buttons/EditorLeaveDeckButton.vue'
import TheEditorHoveredDeckCard from '@/Vue/components/editor/TheEditorHoveredDeckCard.vue'

export default Vue.extend({
	components: {
		EditorDeckName,
		EditorSaveDeckButton,
		EditorExportDeckButton,
		EditorDeleteDeckButton,
		EditorLeaveDeckButton,
		EditorDeckCardListItem,
		EditorDeckCardListSeparator,
		TheEditorHoveredDeckCard,
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
		onScroll(): void {
			if (store.state.editor.hoveredDeckCard.scrollCallback) {
				store.state.editor.hoveredDeckCard.scrollCallback()
			}
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.editor-deck-card-list {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 8px 8px 0 8px;
		width: 100%;
		height: 100%;
		input[type="text"] {
			display: block;
			font-size: 1.4em;
			font-family: 'Roboto', sans-serif;
			background: none;
			text-align: center;
			width: calc(100% - 32px);
			margin: 0 8px;

			&:hover, &:focus {
				background: rgba(white, 0.1);
			}
		}

		.card-list {
			width: 100%;
			display: flex;
			flex-direction: column;
			overflow-y: auto;
		}

		.buttons {
			width: calc(100% - 24px);
			display: flex;
			flex-wrap: wrap;
			flex-direction: row;
			justify-content: center;
			margin: 24px 12px;

			.button-container {
				flex: 1;
				margin: 4px 4px;
				font-size: 1.2em;
			}
		}
	}
</style>
