<template>
	<div class="the-editor-deck-list">
		<div class="deck-list" v-if="isDeckListDisplayed">
			<div class="deck-list-segment" v-for="deckFilter in deckFilters" :key="String(deckFilter.faction) + deckFilter.experimental">
				<div v-if="deckFilter.decks.length > 0">
					<the-deck-list-separator :faction="deckFilter.faction" :is-experimental="deckFilter.experimental" />
					<the-deck-list-item v-for="deck in deckFilter.decks" :key="deck.id" :deck="deck" />
				</div>
			</div>
			<div class="deck-list-segment" v-if="draftDecks.length > 0 && mode === DeckListMode.EDIT">
				<the-deck-list-separator-unfinished />
				<the-deck-list-item v-for="deck in draftDecks" :key="deck.id" :deck="deck" />
			</div>
			<the-deck-list-separator-actions v-if="mode === DeckListMode.EDIT" />
			<the-deck-list-item-create-new v-if="mode === DeckListMode.EDIT" />
		</div>
		<div class="buttons">
			<editor-create-deck-button v-if="decks.length === 0 && mode === DeckListMode.SELECT" />
			<div class="create-button-sizer" v-if="decks.length === 0 && mode === DeckListMode.EDIT">
				<editor-create-deck-button />
			</div>
			<editor-decks-button v-if="mode === DeckListMode.SELECT && finishedDecks.length === 0" />
		</div>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import CardFaction from '@shared/enums/CardFaction'
import TheDeckListItem from '@/Vue/components/editor/TheDeckListItem.vue'
import TheDeckListItemCreateNew from '@/Vue/components/editor/TheDeckListItemCreateNew.vue'
import TheDeckListSeparator from '@/Vue/components/editor/TheDeckListSeparator.vue'
import TheDeckListSeparatorActions from '@/Vue/components/editor/TheDeckListSeparatorActions.vue'
import TheDeckListSeparatorUnfinished from '@/Vue/components/editor/TheDeckListSeparatorUnfinished.vue'
import PopulatedEditorDeck from '@/utils/editor/PopulatedEditorDeck'
import DeckListMode from '@/utils/DeckListMode'
import EditorCreateDeckButton from '@/Vue/components/editor/buttons/EditorCreateDeckButton.vue'
import EditorDecksButton from '@/Vue/components/editor/buttons/EditorDecksButton.vue'
import { defineComponent } from 'vue'

type FilteredDeck = { faction: CardFaction; experimental: boolean; decks: PopulatedEditorDeck[] }

export default defineComponent({
	components: {
		TheDeckListItem,
		TheDeckListItemCreateNew,
		TheDeckListSeparator,
		TheDeckListSeparatorActions,
		TheDeckListSeparatorUnfinished,
		EditorCreateDeckButton,
		EditorDecksButton,
	},

	data: () => ({
		CardFaction: CardFaction,
		DeckListMode: DeckListMode,
	}),

	computed: {
		mode(): DeckListMode {
			return this.$route.matched.some(({ name }) => name === 'home') ? DeckListMode.SELECT : DeckListMode.EDIT
		},

		deckFilters(): FilteredDeck[] {
			const factions = [CardFaction.HUMAN, CardFaction.ARCANE, CardFaction.WILD, CardFaction.NEUTRAL]

			return factions.reduce((result: FilteredDeck[], faction) => {
				const normalDeck = {
					faction: faction,
					experimental: false,
					decks: this.decks.filter((deck) => deck.faction === faction && !deck.isExperimental && !deck.isDraft),
				}
				const experimentalDeck = {
					faction: faction,
					experimental: true,
					decks: this.decks.filter((deck) => deck.faction === faction && deck.isExperimental && !deck.isDraft),
				}
				return result.concat(normalDeck).concat(experimentalDeck)
			}, [])
		},

		decks(): PopulatedEditorDeck[] {
			return store.state.editor.decks
		},

		finishedDecks(): PopulatedEditorDeck[] {
			return this.decks.filter((deck) => !deck.isDraft)
		},

		draftDecks(): PopulatedEditorDeck[] {
			return this.decks.filter((deck) => deck.isDraft)
		},

		isDeckListDisplayed(): boolean {
			return (
				(this.mode === DeckListMode.SELECT && this.finishedDecks.length > 0) || (this.mode === DeckListMode.EDIT && this.decks.length > 0)
			)
		},
	},

	created(): void {
		store.dispatch.editor.loadDecks()
	},

	methods: {},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

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
		flex-direction: column;
		margin: 16px 0;

		.create-button-sizer {
			width: calc(100% - 32px);
			display: flex;
			flex-direction: column;
			justify-content: center;
			padding: 0 16px;
		}
	}
}
</style>
