import CardStats from '../../CardStats'
import CardStatsMessage from './CardStatsMessage'

export default class OpenCardStatsMessage implements CardStatsMessage {
	cardId: string

	power: number
	maxPower: number
	basePower: number

	armor: number
	maxArmor: number
	baseArmor: number

	unitCost: number
	baseUnitCost: number

	spellCost: number
	baseSpellCost: number

	constructor(stats: CardStats) {
		this.cardId = stats.card.id

		this.power = stats.power
		this.maxPower = stats.maxPower
		this.basePower = stats.basePower

		this.armor = stats.armor
		this.maxArmor = stats.maxArmor
		this.baseArmor = stats.baseArmor

		this.unitCost = stats.unitCost
		this.baseUnitCost = stats.baseUnitCost

		this.spellCost = stats.spellCost
		this.baseSpellCost = stats.baseSpellCost
	}
}
