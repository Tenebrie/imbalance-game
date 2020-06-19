<template>
	<div class="the-editor-deck-list">
		<div class="deck-list" v-if="isDeckListDisplayed">
			<div class="deck-list-segment" v-if="arcaneDecks.length > 0">
				<the-editor-deck-list-separator :faction="CardFaction.ARCANE" />
				<the-editor-deck-list-item v-for="deck in arcaneDecks" :key="deck.id" :deck="deck" />
			</div>
			<div class="deck-list-segment" v-if="neutralDecks.length > 0">
				<the-editor-deck-list-separator :faction="CardFaction.NEUTRAL" />
				<the-editor-deck-list-item v-for="deck in neutralDecks" :key="deck.id" :deck="deck" />
			</div>
			<div class="deck-list-segment" v-if="experimentalDecks.length > 0">
				<the-editor-deck-list-separator :faction="CardFaction.EXPERIMENTAL" />
				<the-editor-deck-list-item v-for="deck in experimentalDecks" :key="deck.id" :deck="deck" />
			</div>
			<div class="deck-list-segment" v-if="unfinishedDecks.length > 0 && mode === DeckListMode.EDIT">
				<the-editor-deck-list-separator-unfinished />
				<the-editor-deck-list-item v-for="deck in unfinishedDecks" :key="deck.id" :deck="deck" />
			</div>
		</div>
		<div class="buttons">
			<editor-create-deck-button v-if="mode === DeckListMode.EDIT || decks.length === 0" />
			<editor-decks-button v-if="mode === DeckListMode.SELECT && finishedDecks.length === 0 && decks.length > 0" />
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import CardFaction from '@shared/enums/CardFaction'
import TheEditorDeckListItem from '@/Vue/components/editor/TheDeckListItem.vue'
import TheEditorDeckListSeparator from '@/Vue/components/editor/TheDeckListSeparator.vue'
import TheEditorDeckListSeparatorUnfinished from '@/Vue/components/editor/TheDeckListSeparatorUnfinished.vue'
import PopulatedEditorDeck from '@/utils/editor/PopulatedEditorDeck'
import DeckListMode from '@/utils/DeckListMode'
import EditorCreateDeckButton from '@/Vue/components/editor/buttons/EditorCreateDeckButton.vue'
import EditorDecksButton from '@/Vue/components/editor/buttons/EditorDecksButton.vue'

export default Vue.extend({
	components: {
		TheEditorDeckListItem,
		TheEditorDeckListSeparator,
		TheEditorDeckListSeparatorUnfinished,
		EditorCreateDeckButton,
		EditorDecksButton
	},

	data: () => ({
		CardFaction: CardFaction,
		DeckListMode: DeckListMode,
	}),

	computed: {
		mode(): DeckListMode {
			return this.$route.matched.some(({ name }) => name === 'home') ? DeckListMode.SELECT : DeckListMode.EDIT
		},

		decks(): PopulatedEditorDeck[] {
			return store.state.editor.decks
		},

		arcaneDecks(): PopulatedEditorDeck[] {
			return this.decks.filter(deck => deck.faction === CardFaction.ARCANE && !deck.isUnfinished())
		},

		neutralDecks(): PopulatedEditorDeck[] {
			return this.decks.filter(deck => deck.faction === CardFaction.NEUTRAL && !deck.isUnfinished())
		},

		experimentalDecks(): PopulatedEditorDeck[] {
			return this.decks.filter(deck => deck.faction === CardFaction.EXPERIMENTAL && !deck.isUnfinished())
		},

		finishedDecks(): PopulatedEditorDeck[] {
			return this.decks.filter(deck => !deck.isUnfinished())
		},

		unfinishedDecks(): PopulatedEditorDeck[] {
			return this.decks.filter(deck => deck.isUnfinished())
		},

		isDeckListDisplayed(): boolean {
			return (this.mode === DeckListMode.SELECT && this.finishedDecks.length > 0) ||
				(this.mode === DeckListMode.EDIT && this.decks.length > 0)
		}
	},

	created(): void {
		store.dispatch.editor.loadDecks()
	},

	methods: {

	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-editor-deck-list {
		width: calc(100%);
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;

		.deck-list {
			height: 100%;
			display: flex;
			flex-direction: column;
			padding-top: 16px;
			overflow-y: auto;

			.deck-list-segment {
				display: flex;
				flex-direction: column;
			}

			.deck-link {
				padding: 4px 16px;
				text-align: start;
				font-size: 1.4em;
				cursor: pointer;

				&:hover {
					background: $COLOR-BACKGROUND-TRANSPARENT;
				}
			}
		}

		.buttons {
			width: 100%;
			display: flex;
		}
	}
</style>
