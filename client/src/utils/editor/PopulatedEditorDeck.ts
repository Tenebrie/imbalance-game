import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import Utils from '@/utils/Utils'
import Constants from '@shared/Constants'
import PopulatedEditorCard from '@shared/models/PopulatedEditorCard'
import { getMaxCardCountForColor } from '@shared/Utils'

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
		return this.cards.find((card) => card.color === CardColor.LEADER) || null
	}

	public get faction(): CardFaction {
		if (this.leader && this.leader.faction !== CardFaction.NEUTRAL) {
			return this.leader.faction
		}
		const factionCard = this.cards.find((card) => card.faction !== CardFaction.NEUTRAL)
		if (factionCard) {
			return factionCard.faction
		}
		return CardFaction.NEUTRAL
	}

	public get isExperimental(): boolean {
		return !!this.cards.find((card) => card.isExperimental)
	}

	public get isDraft(): boolean {
		return (
			!this.leader ||
			this.cardCount !== Constants.CARD_LIMIT_TOTAL ||
			this.cards.some((card) => card.count > getMaxCardCountForColor(card.color))
		)
	}

	public get cardCount(): number {
		return this.cards.map((card) => card.count).reduce((previousValue, currentValue) => previousValue + currentValue, 0)
	}
}
