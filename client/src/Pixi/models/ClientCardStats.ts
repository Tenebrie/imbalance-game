import CardStats from '@shared/models/CardStats'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardStatsMessage from '@shared/models/network/cardStats/CardStatsMessage'

export default class ClientBuffContainer implements CardStats {
	readonly card: RenderedCard

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

	public constructor(card: RenderedCard, message: CardStatsMessage) {
		this.card = card

		this.power = message.power || 0
		this.maxPower = message.maxPower || 0
		this.basePower = message.basePower || 0

		this.armor = message.armor || 0
		this.maxArmor = message.maxArmor || 0
		this.baseArmor = message.baseArmor || 0

		this.unitCost = message.unitCost || 0
		this.baseUnitCost = message.baseUnitCost || 0

		this.spellCost = message.spellCost || 0
		this.baseSpellCost = message.baseSpellCost || 0
	}
}
