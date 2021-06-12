import ServerUnit from '../game/models/ServerUnit'
import { EventSubscriber } from '@src/game/models/ServerGameEvents'
import ServerCard from '@src/game/models/ServerCard'
import { ServerBuffSource } from '@src/game/models/buffs/ServerBuffContainer'
import ServerBuff from '@src/game/models/buffs/ServerBuff'

export type LeaderStatValueGetter = (card: EventSubscriber | ServerBuffSource) => number

const asSingleUnitStat = (value: number, mapper: (unit: ServerUnit) => number): LeaderStatValueGetter => {
	return (subscriber: EventSubscriber | ServerBuffSource) => {
		if (subscriber === null) {
			return value
		}

		const owner =
			subscriber instanceof ServerCard ? subscriber.owner : subscriber instanceof ServerBuff ? subscriber.parent.owner : subscriber.owner
		const totalBoardStat = subscriber.game.board
			.getUnitsOwnedByPlayer(owner)
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
