import LeaderStatType from '@shared/enums/LeaderStatType'
import { ServerBuffSource } from '@src/game/models/buffs/ServerBuffContainer'
import ServerCard from '@src/game/models/ServerCard'
import { EventSubscriber } from '@src/game/models/ServerGameEvents'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import { getOwnerGroup, getOwnerPlayer, getTotalLeaderStat } from '@src/utils/Utils'

export type ValueGetter = (context: EventSubscriber | ServerBuffSource | ServerPlayerGroup) => number

const asScalingStat = (value: number, stats: LeaderStatType[]): ValueGetter => {
	return (subscriber: EventSubscriber | ServerBuffSource | ServerPlayerGroup) => {
		if (subscriber === null) {
			return value
		}

		const owner =
			subscriber instanceof ServerPlayerGroup
				? subscriber
				: subscriber instanceof ServerCard && subscriber.unit
				? subscriber.ownerGroup
				: getOwnerPlayer(subscriber) || getOwnerGroup(subscriber)
		if (!owner) {
			return value
		}

		return value + getTotalLeaderStat(owner, stats)
	}
}

export const asDirectUnitDamage = (baseDamage: number): ValueGetter => {
	return asScalingStat(baseDamage, [LeaderStatType.DIRECT_UNIT_DAMAGE])
}

export const asSplashUnitDamage = (baseDamage: number): ValueGetter => {
	return asScalingStat(baseDamage, [LeaderStatType.SPLASH_UNIT_DAMAGE])
}

export const asRecurringUnitDamage = (baseDamage: number): ValueGetter => {
	return asScalingStat(baseDamage, [LeaderStatType.RECURRING_UNIT_DAMAGE])
}

export const asDirectSpellDamage = (baseDamage: number): ValueGetter => {
	return asScalingStat(baseDamage, [LeaderStatType.DIRECT_SPELL_DAMAGE])
}

export const asSplashSpellDamage = (baseDamage: number): ValueGetter => {
	return asScalingStat(baseDamage, [LeaderStatType.SPLASH_SPELL_DAMAGE])
}

export const asDirectHealingPotency = (potency: number): ValueGetter => {
	return asScalingStat(potency, [LeaderStatType.DIRECT_HEALING_POTENCY])
}

export const asSplashHealingPotency = (potency: number): ValueGetter => {
	return asScalingStat(potency, [LeaderStatType.SPLASH_HEALING_POTENCY])
}

export const asRecurringHealingPotency = (potency: number): ValueGetter => {
	return asScalingStat(potency, [LeaderStatType.RECURRING_HEALING_POTENCY])
}

export const asDirectBuffPotency = (potency: number): ValueGetter => {
	return asScalingStat(potency, [LeaderStatType.DIRECT_BUFF_POTENCY])
}

export const asSplashBuffPotency = (potency: number): ValueGetter => {
	return asScalingStat(potency, [LeaderStatType.SPLASH_BUFF_POTENCY])
}

export const asRecurringBuffPotency = (potency: number): ValueGetter => {
	return asScalingStat(potency, [LeaderStatType.RECURRING_BUFF_POTENCY])
}

export const asDirectEffectDuration = (duration: number): ValueGetter => {
	return asScalingStat(duration, [LeaderStatType.DIRECT_EFFECT_DURATION])
}

export const asSplashEffectDuration = (duration: number): ValueGetter => {
	return asScalingStat(duration, [LeaderStatType.SPLASH_EFFECT_DURATION])
}

export const asDirectSummonCount = (count: number): ValueGetter => {
	return asScalingStat(count, [LeaderStatType.DIRECT_SUMMON_COUNT])
}

export const asRecurringSummonCount = (count: number): ValueGetter => {
	return asScalingStat(count, [LeaderStatType.RECURRING_SUMMON_COUNT])
}

export const asTargetCount = (count: number): ValueGetter => {
	return asScalingStat(count, [LeaderStatType.DIRECT_TARGET_COUNT])
}

export const asCriticalDamageChance = (value: number): ValueGetter => {
	return asScalingStat(value, [LeaderStatType.CRITICAL_DAMAGE_CHANCE])
}

export const asCriticalBuffChance = (value: number): ValueGetter => {
	return asScalingStat(value, [LeaderStatType.CRITICAL_BUFF_CHANCE])
}

export const asCriticalHealChance = (value: number): ValueGetter => {
	return asScalingStat(value, [LeaderStatType.CRITICAL_DAMAGE_CHANCE])
}

export const asDirectSparkDamage = (value: number): ValueGetter => {
	return asScalingStat(value, [LeaderStatType.DIRECT_SPELL_DAMAGE, LeaderStatType.SPARK_DAMAGE])
}

export const asSplashSparkDamage = (value: number): ValueGetter => {
	return asScalingStat(value, [LeaderStatType.SPLASH_SPELL_DAMAGE, LeaderStatType.SPARK_DAMAGE])
}
