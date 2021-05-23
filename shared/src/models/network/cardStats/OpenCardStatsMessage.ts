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

	directUnitDamage: number
	splashUnitDamage: number
	directSpellDamage: number
	splashSpellDamage: number
	directHealingPotency: number
	splashHealingPotency: number
	directBuffPotency: number
	splashBuffPotency: number
	directEffectDuration: number
	splashEffectDuration: number
	directTargetCount: number
	criticalDamageChance: number
	criticalBuffChance: number
	criticalHealChance: number

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

		this.directUnitDamage = stats.directUnitDamage
		this.splashUnitDamage = stats.splashUnitDamage
		this.directSpellDamage = stats.directSpellDamage
		this.splashSpellDamage = stats.splashSpellDamage
		this.directHealingPotency = stats.directHealingPotency
		this.splashHealingPotency = stats.splashHealingPotency
		this.directBuffPotency = stats.directBuffPotency
		this.splashBuffPotency = stats.splashBuffPotency
		this.directEffectDuration = stats.directEffectDuration
		this.splashEffectDuration = stats.splashEffectDuration
		this.directTargetCount = stats.directTargetCount
		this.criticalDamageChance = stats.criticalDamageChance
		this.criticalBuffChance = stats.criticalBuffChance
		this.criticalHealChance = stats.criticalHealChance
	}
}
