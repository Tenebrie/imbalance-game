import ServerCard from './ServerCard'
import ServerGame from './ServerGame'
import CardStats from '@shared/models/CardStats'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'

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
		return Math.max(this.__power, 0)
	}
	public set power(value: number) {
		if (this.__power === value) { return }

		this.__power = Math.min(value, this.__maxPower)
		OutgoingMessageHandlers.notifyAboutCardStatsChange(this.card)
	}

	public get maxPower(): number {
		return this.__maxPower
	}
	public set maxPower(value: number) {
		if (this.__maxPower === value) { return }

		this.__maxPower = Math.max(value, 0)
		if (this.__power > this.__maxPower) {
			this.__power = this.__maxPower
		}
		OutgoingMessageHandlers.notifyAboutCardStatsChange(this.card)
	}

	public get basePower(): number {
		return this.__basePower
	}

	public get actualPower(): number {
		return this.__power
	}

	/* Armor */
	public get armor(): number {
		return Math.max(this.__armor, 0)
	}
	public set armor(value: number) {
		if (this.__armor === value) { return }

		this.__armor = Math.min(value, this.__maxArmor)
		OutgoingMessageHandlers.notifyAboutCardStatsChange(this.card)
	}

	public get maxArmor(): number {
		return this.__maxArmor
	}
	public set maxArmor(value: number) {
		if (this.__maxArmor === value) { return }

		this.__maxArmor = Math.max(value, 0)
		if (this.__armor > this.__maxArmor) {
			this.__armor = this.__maxArmor
		}
		OutgoingMessageHandlers.notifyAboutCardStatsChange(this.card)
	}

	public get baseArmor(): number {
		return this.__baseArmor
	}

	public get actualArmor(): number {
		return this.__armor
	}

	/* Unit cost */
	public get unitCost(): number {
		return this.__unitCost
	}

	public set unitCost(value: number) {
		if (this.__unitCost === value) { return }

		this.__unitCost = Math.max(value, 0)
		OutgoingMessageHandlers.notifyAboutCardStatsChange(this.card)
	}

	public get baseUnitCost(): number {
		return this.__baseUnitCost
	}

	/* Spell cost */
	public get spellCost(): number {
		return this.__spellCost
	}

	public set spellCost(value: number) {
		if (this.__spellCost === value) { return }

		this.__spellCost = Math.max(value, 0)
		OutgoingMessageHandlers.notifyAboutCardStatsChange(this.card)
	}

	public get baseSpellCost(): number {
		return this.__baseSpellCost
	}
}
