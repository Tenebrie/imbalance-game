import EditorCard from '@shared/models/EditorCard'
import EditorDeck from '@shared/models/EditorDeck'
import { createRandomEditorDeckId, getClassFromConstructor } from '@src/utils/Utils'

import { CardConstructor } from '../libraries/CardLibrary'

export default class ServerEditorDeck implements EditorDeck {
	id: string
	name: string
	cards: EditorCard[]

	private constructor(name: string, cards: EditorCard[]) {
		this.id = createRandomEditorDeckId()
		this.name = name
		this.cards = cards
	}

	public static newDeck(): ServerEditorDeck {
		return new ServerEditorDeck('New deck', [])
	}

	public static fromConstructors(cards: (CardConstructor | { card: CardConstructor; count: number })[]): ServerEditorDeck {
		const editorCards: EditorCard[] = []

		cards.forEach((cardConstructor) => {
			if ('card' in cardConstructor) {
				editorCards.push({
					class: getClassFromConstructor(cardConstructor.card),
					count: cardConstructor.count,
				})
			} else {
				editorCards.push({
					class: getClassFromConstructor(cardConstructor),
					count: 1,
				})
			}
		})

		return new ServerEditorDeck('Template deck', editorCards)
	}
}
