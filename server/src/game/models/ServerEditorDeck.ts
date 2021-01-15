import EditorDeck from '@shared/models/EditorDeck'
import CardDeck from '@shared/models/CardDeck'
import EditorCard from '@shared/models/EditorCard'
import { createRandomEditorDeckId } from '@src/utils/Utils'

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

	public static fromTemplate(template: CardDeck): ServerEditorDeck {
		const cards: EditorCard[] = []

		template.unitCards.forEach((card) => {
			const matchingCard = cards.find((testCard) => testCard.class === card.class)
			if (matchingCard) {
				matchingCard.count += 1
			} else {
				cards.push({ class: card.class, count: 1 })
			}
		})
		return new ServerEditorDeck('Template deck', cards)
	}
}
