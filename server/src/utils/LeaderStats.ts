import ServerCard from '../game/models/ServerCard'
import ServerUnit from '../game/models/ServerUnit'

export type LeaderStatValueGetter = (card: ServerCard | null) => number

const asSingleUnitStat = (value: number, mapper: (unit: ServerUnit) => number): LeaderStatValueGetter => {
	return (card: ServerCard | null) => {
		const totalBoardStat =
			card === null
				? 0
				: card.game.board
						.getUnitsOwnedByPlayer(card.owner)
						.map(mapper)
						.reduce((acc, val) => acc + val, 0)
		return value + totalBoardStat
	}
}

export const asDirectUnitDamage = (baseDamage: number): LeaderStatValueGetter => {
	return asSingleUnitStat(baseDamage, (unit) => unit.card.stats.soloUnitDamage)
}

export const asSplashUnitDamage = (baseDamage: number): LeaderStatValueGetter => {
	return asSingleUnitStat(baseDamage, (unit) => unit.card.stats.massUnitDamage)
}

export const asDirectSpellDamage = (baseDamage: number): LeaderStatValueGetter => {
	return asSingleUnitStat(baseDamage, (unit) => unit.card.stats.soloSpellDamage)
}

export const asSplashSpellDamage = (baseDamage: number): LeaderStatValueGetter => {
	return asSingleUnitStat(baseDamage, (unit) => unit.card.stats.massSpellDamage)
}

export const asDirectHealingPotency = (potency: number): LeaderStatValueGetter => {
	return asSingleUnitStat(potency, (unit) => unit.card.stats.soloHealingPotency)
}

export const asSplashHealingPotency = (potency: number): LeaderStatValueGetter => {
	return asSingleUnitStat(potency, (unit) => unit.card.stats.massHealingPotency)
}

export const asDirectBuffPotency = (potency: number): LeaderStatValueGetter => {
	return asSingleUnitStat(potency, (unit) => unit.card.stats.soloBuffPotency)
}

export const asSplashBuffPotency = (potency: number): LeaderStatValueGetter => {
	return asSingleUnitStat(potency, (unit) => unit.card.stats.massBuffPotency)
}

export const asDirectEffectDuration = (duration: number): LeaderStatValueGetter => {
	return asSingleUnitStat(duration, (unit) => unit.card.stats.soloEffectDuration)
}

export const asSplashEffectDuration = (duration: number): LeaderStatValueGetter => {
	return asSingleUnitStat(duration, (unit) => unit.card.stats.massEffectDuration)
}

export const asTargetCount = (count: number): LeaderStatValueGetter => {
	return asSingleUnitStat(count, (unit) => unit.card.stats.targetCount)
}

export const asCriticalHitChance = (value: number): LeaderStatValueGetter => {
	return asSingleUnitStat(value, (unit) => unit.card.stats.criticalHitChance)
}

export const asCriticalBuffChance = (value: number): LeaderStatValueGetter => {
	return asSingleUnitStat(value, (unit) => unit.card.stats.criticalBuffChance)
}

export const asCriticalHealChance = (value: number): LeaderStatValueGetter => {
	return asSingleUnitStat(value, (unit) => unit.card.stats.criticalHealChance)
}
