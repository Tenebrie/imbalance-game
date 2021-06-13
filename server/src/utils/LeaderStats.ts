import ServerUnit from '../game/models/ServerUnit'
import { EventSubscriber } from '@src/game/models/ServerGameEvents'
import ServerCard from '@src/game/models/ServerCard'
import { ServerBuffSource } from '@src/game/models/buffs/ServerBuffContainer'
import ServerBuff from '@src/game/models/buffs/ServerBuff'
import LeaderStatType from '@src/../../shared/src/enums/LeaderStatType'

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
	return asSingleUnitStat(baseDamage, (unit) => unit.card.stats.getLeaderStat(LeaderStatType.DIRECT_UNIT_DAMAGE))
}

export const asSplashUnitDamage = (baseDamage: number): LeaderStatValueGetter => {
	return asSingleUnitStat(baseDamage, (unit) => unit.card.stats.getLeaderStat(LeaderStatType.SPLASH_UNIT_DAMAGE))
}

export const asDirectSpellDamage = (baseDamage: number): LeaderStatValueGetter => {
	return asSingleUnitStat(baseDamage, (unit) => unit.card.stats.getLeaderStat(LeaderStatType.DIRECT_SPELL_DAMAGE))
}

export const asSplashSpellDamage = (baseDamage: number): LeaderStatValueGetter => {
	return asSingleUnitStat(baseDamage, (unit) => unit.card.stats.getLeaderStat(LeaderStatType.SPLASH_SPELL_DAMAGE))
}

export const asDirectHealingPotency = (potency: number): LeaderStatValueGetter => {
	return asSingleUnitStat(potency, (unit) => unit.card.stats.getLeaderStat(LeaderStatType.DIRECT_HEALING_POTENCY))
}

export const asSplashHealingPotency = (potency: number): LeaderStatValueGetter => {
	return asSingleUnitStat(potency, (unit) => unit.card.stats.getLeaderStat(LeaderStatType.SPLASH_HEALING_POTENCY))
}

export const asRecurringHealingPotency = (potency: number): LeaderStatValueGetter => {
	return asSingleUnitStat(potency, (unit) => unit.card.stats.getLeaderStat(LeaderStatType.RECURRING_HEALING_POTENCY))
}

export const asDirectBuffPotency = (potency: number): LeaderStatValueGetter => {
	return asSingleUnitStat(potency, (unit) => unit.card.stats.getLeaderStat(LeaderStatType.DIRECT_BUFF_POTENCY))
}

export const asSplashBuffPotency = (potency: number): LeaderStatValueGetter => {
	return asSingleUnitStat(potency, (unit) => unit.card.stats.getLeaderStat(LeaderStatType.SPLASH_BUFF_POTENCY))
}

export const asRecurringBuffPotency = (potency: number): LeaderStatValueGetter => {
	return asSingleUnitStat(potency, (unit) => unit.card.stats.getLeaderStat(LeaderStatType.RECURRING_BUFF_POTENCY))
}

export const asDirectEffectDuration = (duration: number): LeaderStatValueGetter => {
	return asSingleUnitStat(duration, (unit) => unit.card.stats.getLeaderStat(LeaderStatType.DIRECT_EFFECT_DURATION))
}

export const asSplashEffectDuration = (duration: number): LeaderStatValueGetter => {
	return asSingleUnitStat(duration, (unit) => unit.card.stats.getLeaderStat(LeaderStatType.SPLASH_EFFECT_DURATION))
}

export const asTargetCount = (count: number): LeaderStatValueGetter => {
	return asSingleUnitStat(count, (unit) => unit.card.stats.getLeaderStat(LeaderStatType.DIRECT_TARGET_COUNT))
}

export const asCriticalDamageChance = (value: number): LeaderStatValueGetter => {
	return asSingleUnitStat(value, (unit) => unit.card.stats.getLeaderStat(LeaderStatType.CRITICAL_DAMAGE_CHANCE))
}

export const asCriticalBuffChance = (value: number): LeaderStatValueGetter => {
	return asSingleUnitStat(value, (unit) => unit.card.stats.getLeaderStat(LeaderStatType.CRITICAL_BUFF_CHANCE))
}

export const asCriticalHealChance = (value: number): LeaderStatValueGetter => {
	return asSingleUnitStat(value, (unit) => unit.card.stats.getLeaderStat(LeaderStatType.CRITICAL_DAMAGE_CHANCE))
}
