import ServerCard from './ServerCard'
import ServerGame from './ServerGame'
import CardStats from '@shared/models/CardStats'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import { limitValueToInterval } from '../../utils/Utils'
import ServerBuff from './ServerBuff'
import CardType from '@shared/enums/CardType'
import CardFeature from '@shared/enums/CardFeature'

interface ServerCardStatsProps {
	power: number
	armor: number
	spellCost: number

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

export default class ServerCardStats implements CardStats {
	public readonly card: ServerCard
	private readonly game: ServerGame

	private __power: number
	private __maxPower: number
	private readonly __basePower: number

	private __armor: number
	private __maxArmor: number
	private readonly __baseArmor: number

	private __unitCost: number
	private readonly __baseUnitCost: number

	private __spellCost: number
	private readonly __baseSpellCost: number

	private readonly __baseDirectUnitDamage: number
	private readonly __baseSplashUnitDamage: number
	private readonly __baseDirectSpellDamage: number
	private readonly __baseSplashSpellDamage: number
	private readonly __baseDirectHealingPotency: number
	private readonly __baseSplashHealingPotency: number
	private readonly __baseDirectBuffPotency: number
	private readonly __baseSplashBuffPotency: number
	private readonly __baseDirectEffectDuration: number
	private readonly __baseSplashEffectDuration: number
	private readonly __baseDirectTargetCount: number
	private readonly __baseCriticalDamageChance: number
	private readonly __baseCriticalBuffChance: number
	private readonly __baseCriticalHealChance: number

	constructor(card: ServerCard, props: ServerCardStatsProps) {
		this.card = card
		this.game = card.game

		this.__power = props.power
		this.__armor = props.armor
		this.__unitCost = card.type === CardType.UNIT ? 1 : 0
		this.__spellCost = props.spellCost

		this.__maxPower = props.power
		this.__maxArmor = props.armor
		this.__basePower = props.power
		this.__baseArmor = props.armor
		this.__baseUnitCost = card.type === CardType.UNIT ? 1 : 0
		this.__baseSpellCost = props.spellCost

		this.__baseDirectUnitDamage = props.directUnitDamage
		this.__baseSplashUnitDamage = props.splashUnitDamage
		this.__baseDirectSpellDamage = props.directSpellDamage
		this.__baseSplashSpellDamage = props.splashSpellDamage
		this.__baseDirectHealingPotency = props.directHealingPotency
		this.__baseSplashHealingPotency = props.splashHealingPotency
		this.__baseDirectBuffPotency = props.directBuffPotency
		this.__baseSplashBuffPotency = props.splashBuffPotency
		this.__baseDirectEffectDuration = props.directEffectDuration
		this.__baseSplashEffectDuration = props.splashEffectDuration
		this.__baseDirectTargetCount = props.directTargetCount
		this.__baseCriticalDamageChance = props.criticalDamageChance
		this.__baseCriticalBuffChance = props.criticalBuffChance
		this.__baseCriticalHealChance = props.criticalHealChance
	}

	/* Power */
	public get power(): number {
		return limitValueToInterval(0, this.__power, this.maxPower)
	}
	public set power(value: number) {
		if (this.__power === value) {
			return
		}

		this.__power = limitValueToInterval(0, value, this.maxPower)
		OutgoingMessageHandlers.notifyAboutCardStatsChange(this.card)
	}

	public get basePower(): number {
		return this.__basePower
	}

	public get maxPower(): number {
		if (this.card.features.includes(CardFeature.BUILDING)) {
			return 0
		}
		return this.card.buffs.buffs.reduce((value: number, buff: ServerBuff) => buff.getMaxPowerOverride(value), this.basePower)
	}

	/* Armor */
	public get armor(): number {
		return limitValueToInterval(0, this.__armor, this.maxArmor)
	}
	public set armor(value: number) {
		if (this.__armor === value) {
			return
		}

		this.__armor = limitValueToInterval(0, value, this.maxArmor)
		OutgoingMessageHandlers.notifyAboutCardStatsChange(this.card)
	}

	public get baseArmor(): number {
		return this.__baseArmor
	}

	public get maxArmor(): number {
		return this.card.buffs.buffs.reduce((value: number, buff: ServerBuff) => buff.getMaxArmorOverride(value), this.baseArmor)
	}

	/* Unit cost */
	public get baseUnitCost(): number {
		if (this.card.features.includes(CardFeature.QUICK)) {
			return 0
		}
		return this.__baseUnitCost
	}

	public get unitCost(): number {
		const value = this.card.buffs.buffs.reduce((value: number, buff: ServerBuff) => buff.getUnitCostOverride(value), this.baseUnitCost)
		return Math.max(value, 0)
	}

	/* Spell cost */
	public get baseSpellCost(): number {
		return this.__baseSpellCost
	}

	public get spellCost(): number {
		const value = this.card.buffs.buffs.reduce((value: number, buff: ServerBuff) => buff.getSpellCostOverride(value), this.baseSpellCost)
		return Math.max(value, 0)
	}

	/* Other */
	public get directUnitDamage(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getDirectUnitDamageOverride(value),
			this.__baseDirectUnitDamage
		)
		return Math.max(value, 0)
	}

	public get splashUnitDamage(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getSplashUnitDamageOverride(value),
			this.__baseSplashUnitDamage
		)
		return Math.max(value, 0)
	}

	public get directSpellDamage(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getDirectSpellDamageOverride(value),
			this.__baseDirectSpellDamage
		)
		return Math.max(value, 0)
	}

	public get splashSpellDamage(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getSplashSpellDamageOverride(value),
			this.__baseSplashSpellDamage
		)
		return Math.max(value, 0)
	}

	public get directHealingPotency(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getDirectHealingPotencyOverride(value),
			this.__baseDirectHealingPotency
		)
		return Math.max(value, 0)
	}

	public get splashHealingPotency(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getSplashHealingPotencyOverride(value),
			this.__baseSplashHealingPotency
		)
		return Math.max(value, 0)
	}

	public get directBuffPotency(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getDirectBuffPotencyOverride(value),
			this.__baseDirectBuffPotency
		)
		return Math.max(value, 0)
	}

	public get splashBuffPotency(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getSplashBuffPotencyOverride(value),
			this.__baseSplashBuffPotency
		)
		return Math.max(value, 0)
	}

	public get directEffectDuration(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getDirectEffectDurationOverride(value),
			this.__baseDirectEffectDuration
		)
		return Math.max(value, 0)
	}

	public get splashEffectDuration(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getSplashEffectDurationOverride(value),
			this.__baseSplashEffectDuration
		)
		return Math.max(value, 0)
	}

	public get directTargetCount(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getDirectTargetCountOverride(value),
			this.__baseDirectTargetCount
		)
		return Math.max(value, 0)
	}

	public get criticalDamageChance(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getCriticalDamageChanceOverride(value),
			this.__baseCriticalDamageChance
		)
		return Math.max(value, 0)
	}

	public get criticalBuffChance(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getCriticalBuffChanceOverride(value),
			this.__baseCriticalBuffChance
		)
		return Math.max(value, 0)
	}

	public get criticalHealChance(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getCriticalHealChanceOverride(value),
			this.__baseCriticalDamageChance
		)
		return Math.max(value, 0)
	}
}
