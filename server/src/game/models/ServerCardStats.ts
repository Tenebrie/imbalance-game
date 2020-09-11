import ServerCard from './ServerCard'
import ServerGame from './ServerGame'
import CardStats from '@shared/models/CardStats'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import {limitValueToInterval} from '../../utils/Utils'
import ServerBuff from './ServerBuff'

interface ServerCardStatsProps {
	basePower: number
	baseArmor: number
	baseSpellCost: number
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

	constructor(card: ServerCard, props: ServerCardStatsProps) {
		this.card = card
		this.game = card.game

		this.__power = props.basePower
		this.__armor = props.baseArmor
		this.__unitCost = 1
		this.__spellCost = props.baseSpellCost

		this.__maxPower = props.basePower
		this.__maxArmor = props.baseArmor
		this.__basePower = props.basePower
		this.__baseArmor = props.baseArmor
		this.__baseUnitCost = 1
		this.__baseSpellCost = props.baseSpellCost
	}

	/* Power */
	public get power(): number {
		return limitValueToInterval(0, this.__power, this.maxPower)
	}
	public set power(value: number) {
		if (this.__power === value) { return }

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
		if (this.__armor === value) { return }

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
}
