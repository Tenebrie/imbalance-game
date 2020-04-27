import uuidv4 from 'uuid/v4'
import {createModule} from 'direct-vuex'
import EditorDeck from '@shared/models/EditorDeck'
import axios from 'axios'
import {moduleActionContext} from '@/Vue/store'
import Card from '@shared/models/Card'
import RenderedEditorCard from '@/Vue/components/editor/RenderedEditorCard'
import CardMessage from '@shared/models/network/CardMessage'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import Utils from '@/utils/Utils'
import CardColor from '@shared/enums/CardColor'
import PopulatedEditorDeck from '@/Vue/components/editor/PopulatedEditorDeck'
import PopulatedEditorCard from '@/Vue/components/editor/PopulatedEditorCard'
import RichTextVariables from '@shared/models/RichTextVariables'
import EditorCard from '@shared/models/EditorCard'

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
			console.log(deckMessage)

			await axios.put(`/api/decks/${payload.deckId}`, deckMessage)
		},

		async loadDecks(context): Promise<void> {
			const { commit } = moduleActionContext(context, editorModule)

			const decks = (await axios.get('/api/decks')).data

			const sortedDecks = decks.map(deck => ({
				...deck,
				cards: Utils.sortEditorCards(deck.cards)
			}))
			commit.setDecks(sortedDecks)
		},

		async addCardToDeck(context, payload: { deckId: string, cardToAdd: CardMessage }): Promise<void> {
			const { state, commit } = moduleActionContext(context, editorModule)

			const newDeck = state.decks.find(deck => deck.id === payload.deckId)

			const maxCount = payload.cardToAdd.color === CardColor.BRONZE ? 3 : 1
			const oldCard = newDeck.cards.find(card => card.class === payload.cardToAdd.class)
			if (oldCard && oldCard.count >= maxCount) {
				return
			}

			if (!oldCard) {
				const cardToAdd: PopulatedEditorCard = {
					...payload.cardToAdd,
					id: uuidv4(),
					count: 1,
					evaluateVariables(): RichTextVariables { return }
				}
				newDeck.cards.push(cardToAdd)
			} else {
				oldCard.count += 1
			}

			newDeck.cards = Utils.sortEditorCards(newDeck.cards)

			commit.updateEditorDeck(newDeck)
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

		async requestRender(context, payload: { card: CardMessage }): Promise<void> {
			await TextureAtlas.prepare()

			const { commit } = moduleActionContext(context, editorModule)

			commit.addToRenderQueue(payload.card)
		},
	}
})

export default editorModule
