<template>
	<div class="the-editor-deck-list">
		<div class="deck-list">
			<div class="deck-list-segment" v-if="arcaneDecks.length > 0">
				<the-editor-deck-list-separator :faction="CardFaction.ARCANE" />
				<keep-alive>
					<the-editor-deck-list-item v-for="deck in arcaneDecks" :key="deck.id" :deck="deck" />
				</keep-alive>
			</div>
			<div class="deck-list-segment" v-if="neutralDecks.length > 0">
				<the-editor-deck-list-separator :faction="CardFaction.NEUTRAL" />
				<keep-alive>
					<the-editor-deck-list-item v-for="deck in neutralDecks" :key="deck.id" :deck="deck" />
				</keep-alive>
			</div>
			<div class="deck-list-segment" v-if="experimentalDecks.length > 0">
				<the-editor-deck-list-separator :faction="CardFaction.EXPERIMENTAL" />
				<keep-alive>
					<the-editor-deck-list-item v-for="deck in experimentalDecks" :key="deck.id" :deck="deck" />
				</keep-alive>
			</div>
			<div class="deck-list-segment" v-if="unfinishedDecks.length > 0 && mode === DeckListMode.EDIT">
				<the-editor-deck-list-separator-unfinished />
				<keep-alive>
					<the-editor-deck-list-item v-for="deck in unfinishedDecks" :key="deck.id" :deck="deck" />
				</keep-alive>
			</div>
		</div>
		<div class="buttons" v-if="mode === DeckListMode.EDIT">
			<editor-create-deck-button />
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

export default Vue.extend({
	components: {
		TheEditorDeckListItem,
		TheEditorDeckListSeparator,
		TheEditorDeckListSeparatorUnfinished,
		EditorCreateDeckButton
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

		unfinishedDecks(): PopulatedEditorDeck[] {
			return this.decks.filter(deck => deck.isUnfinished())
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
		justify-content: space-between;

		.deck-list {
			display: flex;
			flex-direction: column;
			padding-top: 16px;

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
