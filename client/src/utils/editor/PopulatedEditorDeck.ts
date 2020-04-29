import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import Utils from '@/utils/Utils'
import Constants from '@shared/Constants'
import PopulatedEditorCard from '@shared/models/PopulatedEditorCard'

export default class PopulatedEditorDeck {
	public id: string
	public name: string
	public cards: PopulatedEditorCard[]

	public constructor(id: string, name: string, cards: PopulatedEditorCard[]) {
		this.id = id
		this.name = name
		this.cards = Utils.sortEditorCards(cards)
	}

	public get leader(): PopulatedEditorCard | null {
		return this.cards.find(card => card.color === CardColor.LEADER) || null
	}

	public get faction(): CardFaction | null {
		if (this.cards.find(card => card.faction === CardFaction.EXPERIMENTAL)) {
			return CardFaction.EXPERIMENTAL
		}
		return this.leader ? this.leader.faction : null
	}

	public get cardCount(): number {
		return this.cards
			.map(card => card.count)
			.reduce((previousValue, currentValue) => previousValue + currentValue, 0)
	}

	public isUnfinished():  boolean {
		return !this.leader || this.cardCount < Constants.CARD_LIMIT_TOTAL
	}
}
