import ServerCard from '../game/models/ServerCard'
import ServerUnit from '../game/models/ServerUnit'

export type LeaderStatValueGetter = (card: ServerCard | null) => number

const asSingleUnitStat = (value: number, mapper: (unit: ServerUnit) => number): LeaderStatValueGetter => {
	return (card: ServerCard | null) => {
		const totalBoardStat = card === null ? 0 :
			card.game.board.getUnitsOwnedByPlayer(card.owner).map(mapper).reduce((acc, val) => acc + val, 0)
		return value + totalBoardStat
	}
}

export const asSoloUnitDamage = (baseDamage: number): LeaderStatValueGetter => {
	return asSingleUnitStat(baseDamage, (unit => unit.card.stats.soloUnitDamage))
}

export const asMassUnitDamage = (baseDamage: number): LeaderStatValueGetter => {
	return asSingleUnitStat(baseDamage, (unit => unit.card.stats.massUnitDamage))
}

export const asSoloSpellDamage = (baseDamage: number): LeaderStatValueGetter => {
	return asSingleUnitStat(baseDamage, (unit => unit.card.stats.soloSpellDamage))
}

export const asMassSpellDamage = (baseDamage: number): LeaderStatValueGetter => {
	return asSingleUnitStat(baseDamage, (unit => unit.card.stats.massSpellDamage))
}

export const asSoloHealingPotency = (potency: number): LeaderStatValueGetter => {
	return asSingleUnitStat(potency, (unit => unit.card.stats.soloHealingPotency))
}

export const asMassHealingPotency = (potency: number): LeaderStatValueGetter => {
	return asSingleUnitStat(potency, (unit => unit.card.stats.massHealingPotency))
}

export const asSoloBuffPotency = (potency: number): LeaderStatValueGetter => {
	return asSingleUnitStat(potency, (unit => unit.card.stats.soloBuffPotency))
}

export const asMassBuffPotency = (potency: number): LeaderStatValueGetter => {
	return asSingleUnitStat(potency, (unit => unit.card.stats.massBuffPotency))
}

export const asSoloEffectDuration = (duration: number): LeaderStatValueGetter => {
	return asSingleUnitStat(duration, (unit => unit.card.stats.soloEffectDuration))
}

export const asMassEffectDuration = (duration: number): LeaderStatValueGetter => {
	return asSingleUnitStat(duration, (unit => unit.card.stats.massEffectDuration))
}

export const asTargetCount = (count: number): LeaderStatValueGetter => {
	return asSingleUnitStat(count, (unit => unit.card.stats.targetCount))
}

export const asCriticalHitChance = (value: number): LeaderStatValueGetter => {
	return asSingleUnitStat(value, (unit => unit.card.stats.criticalHitChance))
}

export const asCriticalBuffChance = (value: number): LeaderStatValueGetter => {
	return asSingleUnitStat(value, (unit => unit.card.stats.criticalBuffChance))
}

export const asCriticalHealChance = (value: number): LeaderStatValueGetter => {
	return asSingleUnitStat(value, (unit => unit.card.stats.criticalHealChance))
}
