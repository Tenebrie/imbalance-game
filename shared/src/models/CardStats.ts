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
}
