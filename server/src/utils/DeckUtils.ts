import EditorDeck from '@shared/models/EditorDeck'
import OpenCardMessage from '@shared/models/network/card/OpenCardMessage'
import PopulatedEditorDeck from '@shared/models/PopulatedEditorDeck'

import CardLibrary from '../game/libraries/CardLibrary'

export default {
	populateDeck(deck: EditorDeck): PopulatedEditorDeck {
		const libraryCards = CardLibrary.cards.map((card) => new OpenCardMessage(card))
		return {
			...deck,
			cards: deck.cards
				.filter((card) => libraryCards.find((libraryCard) => libraryCard.class === card.class))
				.map((card) => ({
					...libraryCards.find((libraryCard) => libraryCard.class === card.class)!,
					...card,
				})),
		}
	},
}
