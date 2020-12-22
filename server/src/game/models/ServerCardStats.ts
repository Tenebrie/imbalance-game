import ServerCard from './ServerCard'
import ServerGame from './ServerGame'
import CardStats from '@shared/models/CardStats'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import { limitValueToInterval } from '../../utils/Utils'
import ServerBuff from './ServerBuff'
import CardType from '@shared/enums/CardType'

interface ServerCardStatsProps {
	power: number
	armor: number
	spellCost: number

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

	private readonly __baseSoloUnitDamage: number
	private readonly __baseMassUnitDamage: number
	private readonly __baseSoloSpellDamage: number
	private readonly __baseMassSpellDamage: number
	private readonly __baseSoloHealingPotency: number
	private readonly __baseMassHealingPotency: number
	private readonly __baseSoloBuffPotency: number
	private readonly __baseMassBuffPotency: number
	private readonly __baseSoloEffectDuration: number
	private readonly __baseMassEffectDuration: number
	private readonly __baseTargetCount: number
	private readonly __baseCriticalHitChance: number
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

		this.__baseSoloUnitDamage = props.soloUnitDamage
		this.__baseMassUnitDamage = props.massUnitDamage
		this.__baseSoloSpellDamage = props.soloSpellDamage
		this.__baseMassSpellDamage = props.massSpellDamage
		this.__baseSoloHealingPotency = props.soloHealingPotency
		this.__baseMassHealingPotency = props.massHealingPotency
		this.__baseSoloBuffPotency = props.soloBuffPotency
		this.__baseMassBuffPotency = props.massBuffPotency
		this.__baseSoloEffectDuration = props.soloEffectDuration
		this.__baseMassEffectDuration = props.massEffectDuration
		this.__baseTargetCount = props.targetCount
		this.__baseCriticalHitChance = props.criticalHitChance
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
	public get soloUnitDamage(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getSoloUnitDamageOverride(value),
			this.__baseSoloUnitDamage
		)
		return Math.max(value, 0)
	}

	public get massUnitDamage(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getMassUnitDamageOverride(value),
			this.__baseMassUnitDamage
		)
		return Math.max(value, 0)
	}

	public get soloSpellDamage(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getSoloSpellDamageOverride(value),
			this.__baseSoloSpellDamage
		)
		return Math.max(value, 0)
	}

	public get massSpellDamage(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getMassSpellDamageOverride(value),
			this.__baseMassSpellDamage
		)
		return Math.max(value, 0)
	}

	public get soloHealingPotency(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getSoloHealingPotencyOverride(value),
			this.__baseSoloHealingPotency
		)
		return Math.max(value, 0)
	}

	public get massHealingPotency(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getMassHealingPotencyOverride(value),
			this.__baseMassHealingPotency
		)
		return Math.max(value, 0)
	}

	public get soloBuffPotency(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getSoloBuffPotencyOverride(value),
			this.__baseSoloBuffPotency
		)
		return Math.max(value, 0)
	}

	public get massBuffPotency(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getMassBuffPotencyOverride(value),
			this.__baseMassBuffPotency
		)
		return Math.max(value, 0)
	}

	public get soloEffectDuration(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getSoloEffectDurationOverride(value),
			this.__baseSoloEffectDuration
		)
		return Math.max(value, 0)
	}

	public get massEffectDuration(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getMassEffectDurationOverride(value),
			this.__baseMassEffectDuration
		)
		return Math.max(value, 0)
	}

	public get targetCount(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getTargetCountOverride(value),
			this.__baseTargetCount
		)
		return Math.max(value, 0)
	}

	public get criticalHitChance(): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getCriticalHitChanceOverride(value),
			this.__baseCriticalHitChance
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
			this.__baseCriticalHitChance
		)
		return Math.max(value, 0)
	}
}
