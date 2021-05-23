import Card from './Card'

export default interface CardStats {
	card: Card

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
}
