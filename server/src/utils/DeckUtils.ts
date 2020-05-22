import EditorDeck from '@shared/models/EditorDeck'
import CardLibrary from '../game/libraries/CardLibrary'
import CardMessage from '@shared/models/network/CardMessage'
import PopulatedEditorDeck from '@shared/models/PopulatedEditorDeck'

export default {
	populateDeck(deck: EditorDeck): PopulatedEditorDeck {
		const libraryCards = CardLibrary.cards.map(card => CardMessage.fromCard(card))
		return {
			...deck,
			cards: deck.cards
				.filter(card => libraryCards.find(libraryCard => libraryCard.class === card.class))
				.map(card => ({
					...libraryCards.find(libraryCard => libraryCard.class === card.class),
					...card
				})),
		}
	}
}
