import CardStats from '@shared/models/CardStats'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardStatsMessage from '@shared/models/network/cardStats/CardStatsMessage'

export default class ClientCardStats implements CardStats {
	readonly card: RenderedCard

	__power: number
	maxPower: number
	basePower: number

	__armor: number
	maxArmor: number
	baseArmor: number

	__unitCost: number
	baseUnitCost: number

	__spellCost: number
	baseSpellCost: number

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

	public constructor(card: RenderedCard, message: CardStatsMessage) {
		this.card = card

		this.__power = message.power || 0
		this.maxPower = message.maxPower || 0
		this.basePower = message.basePower || 0

		this.__armor = message.armor || 0
		this.maxArmor = message.maxArmor || 0
		this.baseArmor = message.baseArmor || 0

		this.__unitCost = message.unitCost || 0
		this.baseUnitCost = message.baseUnitCost || 0

		this.__spellCost = message.spellCost || 0
		this.baseSpellCost = message.baseSpellCost || 0

		this.soloUnitDamage = message.soloUnitDamage || 0
		this.massUnitDamage = message.massUnitDamage || 0
		this.soloSpellDamage = message.soloSpellDamage || 0
		this.massSpellDamage = message.massSpellDamage || 0
		this.soloHealingPotency = message.soloHealingPotency || 0
		this.massHealingPotency = message.massHealingPotency || 0
		this.soloBuffPotency = message.soloBuffPotency || 0
		this.massBuffPotency = message.massBuffPotency || 0
		this.soloEffectDuration = message.soloEffectDuration || 0
		this.massEffectDuration = message.massEffectDuration || 0
		this.targetCount = message.targetCount || 0
		this.criticalHitChance = message.criticalHitChance || 0
		this.criticalBuffChance = message.criticalBuffChance || 0
		this.criticalHealChance = message.criticalHealChance || 0
	}

	public get power(): number {
		return this.__power
	}
	public set power(value: number) {
		if (this.power === value) {
			return
		}

		const oldValue = this.power
		this.__power = value

		if (String(this.power).length !== String (oldValue).length) {
			this.card.resetDisplayMode()
		} else {
			this.card.updatePowerTextColors()
		}
	}

	public get armor(): number {
		return this.__armor
	}
	public set armor(value: number) {
		if (this.armor === value) {
			return
		}

		const oldValue = this.armor
		this.__armor = value

		if (String(this.armor).length !== String (oldValue).length) {
			this.card.resetDisplayMode()
		} else {
			this.card.updateArmorTextColors()
		}
	}

	public get unitCost(): number {
		return this.__unitCost
	}
	public set unitCost(value: number) {
		this.__unitCost = value
	}

	public get spellCost(): number {
		return this.__spellCost
	}
	public set spellCost(value: number) {
		if (this.spellCost === value) {
			return
		}

		const oldValue = this.__spellCost
		this.__spellCost = value

		if (String(this.spellCost).length !== String (oldValue).length) {
			this.card.resetDisplayMode()
		} else {
			this.card.updateSpellCostTextColors()
		}
	}
}
