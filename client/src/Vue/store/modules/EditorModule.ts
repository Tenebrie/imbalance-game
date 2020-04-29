import uuidv4 from 'uuid/v4'
import { createModule } from 'direct-vuex'
import axios from 'axios'
import { moduleActionContext } from '@/Vue/store'
import Card from '@shared/models/Card'
import RenderedEditorCard from '@/utils/editor/RenderedEditorCard'
import CardMessage from '@shared/models/network/CardMessage'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import Utils from '@/utils/Utils'
import CardColor from '@shared/enums/CardColor'
import PopulatedEditorDeck from '@/utils/editor/PopulatedEditorDeck'
import RichTextVariables from '@shared/models/RichTextVariables'
import Constants from '@shared/Constants'
import PopulatedEditorCard from '@shared/models/PopulatedEditorCard'

const editorModule = createModule({
	namespaced: true,
	state: {
		decks: [] as PopulatedEditorDeck[],
		cardLibrary: [] as Card[],
		renderQueue: [] as CardMessage[],
		renderedCards: [] as RenderedEditorCard[],
	},

	mutations: {
		setDecks(state, decks: PopulatedEditorDeck[]): void {
			state.decks = decks.slice()
		},

		setCardLibrary(state, cardLibrary: Card[]): void {
			state.cardLibrary = cardLibrary.slice()
		},

		addToRenderQueue(state, card: CardMessage): void {
			state.renderQueue.push(card)
		},

		shiftRenderQueue(state): void {
			state.renderQueue.shift()
		},

		addRenderedCard(state, renderedCard: RenderedEditorCard): void {
			state.renderedCards.push(renderedCard)
		},

		updateEditorDeck(state, newDeck: PopulatedEditorDeck): void {
			const oldDeck = state.decks.find(deck => deck.id === newDeck.id)
			state.decks[state.decks.indexOf(oldDeck)] = newDeck
		}
	},

	getters: {
		cardsOfColor: (state) => (payload: { deckId: string, color: CardColor }): number => {
			const deck = state.decks.find(deck => deck.id === payload.deckId) as PopulatedEditorDeck
			if (!deck) {
				return 0
			}
			return deck.cards
				.filter(card => card.color === payload.color)
				.map(card => card.count)
				.reduce((previousValue, currentValue) => previousValue + currentValue, 0)
		}
	},

	actions: {
		async saveDeck(context, payload: { deckId: string }): Promise<void> {
			const { state } = moduleActionContext(context, editorModule)

			const deck = state.decks.find(deck => deck.id === payload.deckId)
			const deckMessage = {
				...deck,
				cards: deck.cards.map(card => ({
					class: card.class,
					count: card.count
				}))
			}

			await axios.put(`/api/decks/${payload.deckId}`, deckMessage)
		},

		async loadDecks(context): Promise<void> {
			const { commit } = moduleActionContext(context, editorModule)

			const decks = (await axios.get('/api/decks')).data

			const sortedDecks = decks.map(deck => new PopulatedEditorDeck(deck.id, deck.name, deck.cards))
			commit.setDecks(sortedDecks)
		},

		async loadCardLibrary(context): Promise<void> {
			const { commit } = moduleActionContext(context, editorModule)

			const response = await axios.get('/api/cards', { params: { collectible: true } })
			const cardMessages = response.data as CardMessage[]
			const sortedMessages = Utils.sortEditorCards(cardMessages)
			commit.setCardLibrary(sortedMessages)
		},

		async addCardToDeck(context, payload: { deckId: string, cardToAdd: CardMessage }): Promise<void> {
			const { state, commit, getters } = moduleActionContext(context, editorModule)

			const deckToModify = state.decks.find(deck => deck.id === payload.deckId)
			const totalCardCount = deckToModify.cards
				.map(card => card.count)
				.reduce((previousValue, currentValue) => previousValue + currentValue, 0)

			if (totalCardCount >= Constants.CARD_LIMIT_TOTAL) {
				return
			}

			const cardOfColorCount = getters.cardsOfColor({ deckId: payload.deckId, color: payload.cardToAdd.color })
			if (cardOfColorCount >= Utils.getMaxCardCountForColor(payload.cardToAdd.color)) {
				return
			}

			const maxCount = payload.cardToAdd.color === CardColor.BRONZE ? 3 : 1
			const cardToModify = deckToModify.cards.find(card => card.class === payload.cardToAdd.class)
			if (cardToModify && cardToModify.count >= maxCount) {
				return
			}

			if (!cardToModify) {
				const cardToAdd: PopulatedEditorCard = {
					...payload.cardToAdd,
					id: uuidv4(),
					count: 1,
					evaluateVariables(): RichTextVariables { return }
				}
				deckToModify.cards.push(cardToAdd)
			} else {
				cardToModify.count += 1
			}

			deckToModify.cards = Utils.sortEditorCards(deckToModify.cards)

			commit.updateEditorDeck(deckToModify)
		},

		async removeCardFromDeck(context, payload: { deckId: string, cardToRemove: CardMessage }): Promise<void> {
			const { state, commit } = moduleActionContext(context, editorModule)

			const newDeck = state.decks.find(deck => deck.id === payload.deckId)
			const oldCard = newDeck.cards.find(card => card.class === payload.cardToRemove.class)
			if (oldCard.count <= 1) {
				newDeck.cards = newDeck.cards.filter(card => card.class !== payload.cardToRemove.class)
			} else {
				oldCard.count -= 1
			}
			commit.updateEditorDeck(newDeck)
		},

		async renameDeck(context, payload: { deckId: string, name: string }): Promise<void> {
			const { state, commit } = moduleActionContext(context, editorModule)
			const deck = state.decks.find(deck => deck.id === payload.deckId)
			deck.name = payload.name

			commit.updateEditorDeck(deck)
		},

		async requestRender(context, payload: { card: CardMessage }): Promise<void> {
			await TextureAtlas.prepare()

			const { commit } = moduleActionContext(context, editorModule)

			commit.addToRenderQueue(payload.card)
		},
	}
})

export default editorModule
