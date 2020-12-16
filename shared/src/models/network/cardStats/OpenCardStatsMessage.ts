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

	soloUnitDamage: number
	massUnitDamage: number
	soloSpellDamage: number
	massSpellDamage: number
	soloHealingPotency: number
	massHealingPotency: number
	soloBuffPotency: number
	massBuffPotency: number
	soloEffectDuration: number
	massEffectDuration: number
	targetCount: number
	criticalHitChance: number
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

		this.soloUnitDamage = stats.soloUnitDamage
		this.massUnitDamage = stats.massUnitDamage
		this.soloSpellDamage = stats.soloSpellDamage
		this.massSpellDamage = stats.massSpellDamage
		this.soloHealingPotency = stats.soloHealingPotency
		this.massHealingPotency = stats.massHealingPotency
		this.soloBuffPotency = stats.soloBuffPotency
		this.massBuffPotency = stats.massBuffPotency
		this.soloEffectDuration = stats.soloEffectDuration
		this.massEffectDuration = stats.massEffectDuration
		this.targetCount = stats.targetCount
		this.criticalHitChance = stats.criticalHitChance
		this.criticalBuffChance = stats.criticalBuffChance
		this.criticalHealChance = stats.criticalHealChance
	}
}
