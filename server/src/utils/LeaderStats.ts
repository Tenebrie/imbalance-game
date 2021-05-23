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
	return asSingleUnitStat(baseDamage, (unit) => unit.card.stats.directUnitDamage)
}

export const asSplashUnitDamage = (baseDamage: number): LeaderStatValueGetter => {
	return asSingleUnitStat(baseDamage, (unit) => unit.card.stats.splashUnitDamage)
}

export const asDirectSpellDamage = (baseDamage: number): LeaderStatValueGetter => {
	return asSingleUnitStat(baseDamage, (unit) => unit.card.stats.directSpellDamage)
}

export const asSplashSpellDamage = (baseDamage: number): LeaderStatValueGetter => {
	return asSingleUnitStat(baseDamage, (unit) => unit.card.stats.splashSpellDamage)
}

export const asDirectHealingPotency = (potency: number): LeaderStatValueGetter => {
	return asSingleUnitStat(potency, (unit) => unit.card.stats.directHealingPotency)
}

export const asSplashHealingPotency = (potency: number): LeaderStatValueGetter => {
	return asSingleUnitStat(potency, (unit) => unit.card.stats.splashHealingPotency)
}

export const asDirectBuffPotency = (potency: number): LeaderStatValueGetter => {
	return asSingleUnitStat(potency, (unit) => unit.card.stats.directBuffPotency)
}

export const asSplashBuffPotency = (potency: number): LeaderStatValueGetter => {
	return asSingleUnitStat(potency, (unit) => unit.card.stats.splashBuffPotency)
}

export const asDirectEffectDuration = (duration: number): LeaderStatValueGetter => {
	return asSingleUnitStat(duration, (unit) => unit.card.stats.directEffectDuration)
}

export const asSplashEffectDuration = (duration: number): LeaderStatValueGetter => {
	return asSingleUnitStat(duration, (unit) => unit.card.stats.splashEffectDuration)
}

export const asTargetCount = (count: number): LeaderStatValueGetter => {
	return asSingleUnitStat(count, (unit) => unit.card.stats.directTargetCount)
}

export const asCriticalDamageChance = (value: number): LeaderStatValueGetter => {
	return asSingleUnitStat(value, (unit) => unit.card.stats.criticalDamageChance)
}

export const asCriticalBuffChance = (value: number): LeaderStatValueGetter => {
	return asSingleUnitStat(value, (unit) => unit.card.stats.criticalBuffChance)
}

export const asCriticalHealChance = (value: number): LeaderStatValueGetter => {
	return asSingleUnitStat(value, (unit) => unit.card.stats.criticalHealChance)
}
