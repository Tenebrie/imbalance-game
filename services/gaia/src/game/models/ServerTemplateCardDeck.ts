import CardColor from '@shared/enums/CardColor'
import CardType from '@shared/enums/CardType'
import CardDeck from '@shared/models/CardDeck'

import CardLibrary from '../libraries/CardLibrary'
import ServerCard from './ServerCard'
import ServerEditorDeck from './ServerEditorDeck'
import ServerGame from './ServerGame'

export default class ServerTemplateCardDeck implements CardDeck {
	public leader: ServerCard
	public unitCards: ServerCard[]
	public spellCards: ServerCard[]
	private readonly originalEditorDeck: ServerEditorDeck

	constructor(leader: ServerCard, unitCards: ServerCard[], spellCards: ServerCard[], editorDeck: ServerEditorDeck) {
		this.leader = leader
		this.unitCards = unitCards
		this.spellCards = spellCards
		this.originalEditorDeck = editorDeck
	}

	public addUnit(card: ServerCard): void {
		this.unitCards.push(card)
	}

	public addSpell(card: ServerCard): void {
		this.spellCards.push(card)
	}

	public clone(game: ServerGame): ServerTemplateCardDeck {
		return ServerTemplateCardDeck.fromEditorDeck(game, this.originalEditorDeck)
	}

	public static fromEditorDeck(game: ServerGame, editorDeck: ServerEditorDeck): ServerTemplateCardDeck {
		const temporaryDeck: ServerCard[] = []
		editorDeck.cards.forEach((card) => {
			for (let i = 0; i < card.count; i++) {
				temporaryDeck.push(CardLibrary.instantiateFromClass(game, card.class))
			}
		})

		let leader: ServerCard | undefined = undefined
		const inflatedUnitDeck: ServerCard[] = []
		const inflatedSpellDeck: ServerCard[] = []
		temporaryDeck.forEach((card) => {
			const inflatedCards = card.deckAddedCards.map((cardPrototype) => CardLibrary.instantiate(game, cardPrototype))
			const inflatedUnitCards = inflatedCards.filter((card) => card.type === CardType.UNIT)
			const inflatedSpellCards = inflatedCards.filter((card) => card.type === CardType.SPELL)
			inflatedUnitCards.forEach((cardPrototype) => inflatedUnitDeck.push(cardPrototype))
			inflatedSpellCards.forEach((cardPrototype) => inflatedSpellDeck.push(cardPrototype))
			if (card.color === CardColor.LEADER) {
				leader = card
			} else {
				inflatedUnitDeck.push(card)
			}
		})
		if (!leader) {
			throw new Error('Inflating a deck without a leader card!')
		}

		return new ServerTemplateCardDeck(leader, inflatedUnitDeck, inflatedSpellDeck, editorDeck)
	}
}
