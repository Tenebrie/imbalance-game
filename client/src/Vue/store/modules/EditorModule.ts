import Constants from '@shared/Constants'
import CardColor from '@shared/enums/CardColor'
import CardMessage from '@shared/models/network/card/CardMessage'
import PopulatedEditorCard from '@shared/models/PopulatedEditorCard'
import { sortCards } from '@shared/Utils'
import axios from 'axios'
import { defineModule } from 'direct-vuex'
import { debounce } from 'throttle-debounce'
import { v4 as uuidv4 } from 'uuid'

import TextureAtlas from '@/Pixi/render/TextureAtlas'
import PopulatedEditorDeck from '@/utils/editor/PopulatedEditorDeck'
import RenderedEditorCard from '@/utils/editor/RenderedEditorCard'
import Utils from '@/utils/Utils'
import { moduleActionContext } from '@/Vue/store'
import HoveredDeckCardModule from '@/Vue/store/modules/HoveredDeckCardModule'

const editorModule = defineModule({
	namespaced: true,

	modules: {
		hoveredDeckCard: HoveredDeckCardModule,
	},

	state: {
		decks: [] as PopulatedEditorDeck[],
		currentDeckId: null as string | null,
		cardLibrary: [] as CardMessage[],
		renderQueue: [] as string[],
		renderedCards: [] as RenderedEditorCard[],
		searchQuery: '' as string,
	},

	mutations: {
		setDecks(state, decks: PopulatedEditorDeck[]): void {
			state.decks = decks.slice()
		},

		setCurrentDeckId(state, deckId: string | null): void {
			state.currentDeckId = deckId
		},

		setCardLibrary(state, cardLibrary: CardMessage[]): void {
			state.cardLibrary = cardLibrary.slice()
		},

		addToRenderQueue(state, card: CardMessage): void {
			state.renderQueue.push(card.class)
		},

		shiftRenderQueue(state): void {
			state.renderQueue.shift()
		},

		addRenderedCard(state, renderedCard: RenderedEditorCard): void {
			state.renderedCards.push(renderedCard)
		},

		clearRenderedCards(state): void {
			state.renderQueue = []
			state.renderedCards = []
		},

		updateEditorDeck(state, newDeck: PopulatedEditorDeck): void {
			const oldDeck = state.decks.find((deck) => deck.id === newDeck.id)
			if (!oldDeck) {
				return
			}
			state.decks[state.decks.indexOf(oldDeck)] = newDeck
		},

		setSearchQuery(state, query: string): void {
			state.searchQuery = query
		},
	},

	getters: {
		deck:
			(state) =>
			(id: string): PopulatedEditorDeck | null => {
				return state.decks.find((deck) => deck.id === id) || null
			},

		currentDeck: (state): PopulatedEditorDeck | null => {
			if (state.currentDeckId === null) {
				return null
			}
			return state.decks.find((deck) => deck.id === state.currentDeckId) || null
		},

		cardsOfColor:
			(state) =>
			(payload: { deckId: string; color: CardColor }): number => {
				const deck = state.decks.find((deck) => deck.id === payload.deckId) as PopulatedEditorDeck
				if (!deck) {
					return 0
				}
				return deck.cards
					.filter((card) => card.color === payload.color)
					.map((card) => card.count)
					.reduce((previousValue, currentValue) => previousValue + currentValue, 0)
			},
	},

	actions: {
		async createDeck(context): Promise<{ status: number; deckId: string }> {
			const { state, commit } = moduleActionContext(context, editorModule)

			const response = await axios.post('/api/decks')
			const deck = response.data.deck as PopulatedEditorDeck | undefined
			if (deck) {
				commit.setDecks(state.decks.concat([new PopulatedEditorDeck(deck.id, deck.name, deck.cards)]))
			}
			return {
				status: response.status,
				deckId: deck ? deck.id : '',
			}
		},

		asyncSave: debounce(250, (context, payload: { deckId: string }) => {
			const { state } = moduleActionContext(context, editorModule)

			const deck = state.decks.find((deck) => deck.id === payload.deckId)
			if (!deck) {
				return
			}

			const deckMessage = {
				...deck,
				cards: deck.cards.map((card) => ({
					class: card.class,
					count: card.count,
				})),
			}

			axios.put(`/api/decks/${payload.deckId}`, deckMessage)
		}),

		async saveDeck(context, payload: { deckId: string }): Promise<number> {
			const { state } = moduleActionContext(context, editorModule)

			const deck = state.decks.find((deck) => deck.id === payload.deckId)
			if (!deck) {
				return 0
			}

			const deckMessage = {
				...deck,
				cards: deck.cards.map((card) => ({
					class: card.class,
					count: card.count,
				})),
			}

			return (await axios.put(`/api/decks/${payload.deckId}`, deckMessage)).status
		},

		async deleteDeck(context, payload: { deckId: string }): Promise<number> {
			const { state, commit } = moduleActionContext(context, editorModule)

			try {
				const response = await axios.delete(`/api/decks/${payload.deckId}`)
				const statusCode = response.status
				if (statusCode === 204) {
					const updatedDecks = state.decks.filter((deck) => deck.id !== payload.deckId)
					commit.setDecks(updatedDecks)
				}
				return statusCode
			} catch (e) {
				return e.response.status
			}
		},

		async loadDecks(context): Promise<void> {
			const { commit } = moduleActionContext(context, editorModule)

			const decks = (await axios.get('/api/decks')).data as PopulatedEditorDeck[]

			const sortedDecks = decks.map((deck) => new PopulatedEditorDeck(deck.id, deck.name, deck.cards))
			commit.setDecks(sortedDecks)
		},

		async loadCardLibrary(context): Promise<void> {
			const { state, commit } = moduleActionContext(context, editorModule)

			if (state.cardLibrary.length > 0) {
				return
			}

			const cardsResponse = await axios.get('/api/cards', { params: { collectible: false } })
			const cardMessages = cardsResponse.data as CardMessage[]
			const sortedMessages = sortCards(cardMessages)
			commit.setCardLibrary(sortedMessages)
		},

		async addCardToDeck(context, payload: { deckId: string; cardToAdd: CardMessage }): Promise<void> {
			const { state, commit, dispatch } = moduleActionContext(context, editorModule)

			const deckToModify = state.decks.find((deck) => deck.id === payload.deckId)
			if (!deckToModify) {
				return
			}

			const totalCardCount = deckToModify.cards
				.map((card) => card.count)
				.reduce((previousValue, currentValue) => previousValue + currentValue, 0)

			if (totalCardCount >= Constants.CARD_LIMIT_TOTAL) {
				return
			}

			if (!Utils.canAddCardToDeck(payload.deckId, payload.cardToAdd)) {
				return
			}

			const cardToModify = deckToModify.cards.find((card) => card.class === payload.cardToAdd.class)
			if (!cardToModify) {
				const cardToAdd: PopulatedEditorCard = {
					...payload.cardToAdd,
					id: uuidv4(),
					count: 1,
				}
				deckToModify.cards.push(cardToAdd)
			} else {
				cardToModify.count += 1
			}

			deckToModify.cards = sortCards(deckToModify.cards)

			commit.updateEditorDeck(deckToModify)
			await dispatch.asyncSave(payload)
		},

		async removeCardFromDeck(context, payload: { deckId: string; cardToRemove: CardMessage }): Promise<void> {
			const { state, commit, dispatch } = moduleActionContext(context, editorModule)

			const newDeck = state.decks.find((deck) => deck.id === payload.deckId)
			if (!newDeck) {
				return
			}
			const oldCard = newDeck.cards.find((card) => card.class === payload.cardToRemove.class)
			if (!oldCard) {
				return
			}

			if (oldCard.count <= 1) {
				newDeck.cards = newDeck.cards.filter((card) => card.class !== payload.cardToRemove.class)
			} else {
				oldCard.count -= 1
			}
			commit.updateEditorDeck(newDeck)
			await dispatch.asyncSave(payload)
		},

		async renameDeck(context, payload: { deckId: string; name: string }): Promise<void> {
			const { state, commit, dispatch } = moduleActionContext(context, editorModule)
			const deck = state.decks.find((deck) => deck.id === payload.deckId)
			if (!deck) {
				return
			}
			deck.name = payload.name

			commit.updateEditorDeck(deck)
			await dispatch.asyncSave(payload)
		},

		async requestRender(context, payload: { card: CardMessage }): Promise<void> {
			const { state, commit } = moduleActionContext(context, editorModule)
			if (state.renderedCards.find((renderedCard) => renderedCard.class === payload.card.class)) {
				console.warn(`Requesting render to existing card ${payload.card.class}`)
				return
			}
			await TextureAtlas.preloadComponents()
			await TextureAtlas.loadCard(payload.card, () => {
				commit.addToRenderQueue(payload.card)
			})
		},
	},
})

export default editorModule
