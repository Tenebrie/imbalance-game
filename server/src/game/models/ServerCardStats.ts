import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import LeaderStatType from '@shared/enums/LeaderStatType'
import CardStats from '@shared/models/CardStats'
import { initializeEnumRecord } from '@shared/Utils'
import { limitValueToInterval } from '@src/utils/Utils'

import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerBuff from './buffs/ServerBuff'
import ServerCard from './ServerCard'
import ServerGame from './ServerGame'

interface ServerCardStatsProps {
	power: number
	armor: number
	spellCost: number
	leaderStats: Record<LeaderStatType, number>
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

	private readonly __baseLeaderStatValue: {
		[index in LeaderStatType]: number
	}

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

		this.__baseLeaderStatValue = props.leaderStats
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
	public get leaderStats(): Record<LeaderStatType, number> {
		return initializeEnumRecord(LeaderStatType, (value) => this.getLeaderStat(value))
	}

	public getLeaderStat(leaderStat: LeaderStatType): number {
		const value = this.card.buffs.buffs.reduce(
			(value: number, buff: ServerBuff) => buff.getLeaderStatOverride(leaderStat, value),
			this.__baseLeaderStatValue[leaderStat]
		)
		return Math.max(value, 0)
	}

	public getLeaderStats(leaderStats: LeaderStatType[]): number {
		return leaderStats.reduce((acc, val) => acc + this.getLeaderStat(val), 0)
	}
}
