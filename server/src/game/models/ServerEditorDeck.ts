import uuidv4 from 'uuid/v4'
import EditorDeck from '@shared/models/EditorDeck'
import DeckLeader from '@shared/enums/DeckLeader'
import CardDeck from '@shared/models/CardDeck'
import EditorCard from '@shared/models/EditorCard'

export default class ServerEditorDeck implements EditorDeck {
	id: string
	name: string
	cards: EditorCard[]
	leader: DeckLeader

	private constructor(name: string, leader: DeckLeader, cards: EditorCard[]) {
		this.id = uuidv4()
		this.name = name
		this.cards = cards
		this.leader = leader
	}

	public static newDeck(leader: DeckLeader): ServerEditorDeck {
		return new ServerEditorDeck('Unnamed deck', leader, [])
	}

	public static fromTemplate(leader: DeckLeader, template: CardDeck): ServerEditorDeck {
		const cards: EditorCard[] = []

		template.unitCards.forEach(card => {
			const matchingCard = cards.find(testCard => testCard.class === card.class)
			if (matchingCard) {
				matchingCard.count += 1
			} else {
				cards.push({ class: card.class, count: 1 })
			}
		})
		return new ServerEditorDeck('Template deck', leader, cards)
	}
}
