import RenderedCard from '@/Pixi/board/RenderedCard'
import BuffStackType from '@shared/enums/BuffStackType'
import BuffMessage from '@shared/models/network/BuffMessage'
import Buff from '@shared/models/Buff'
import Core from '@/Pixi/Core'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import BuffFeature from '@shared/enums/BuffFeature'

export default class ClientBuff implements Buff {
	id: string
	card: RenderedCard
	source: RenderedCard | null
	buffClass: string
	stackType: BuffStackType
	cardTribes: CardTribe[]
	buffFeatures: BuffFeature[]
	cardFeatures: CardFeature[]

	duration: number
	intensity: number
	baseDuration: number
	baseIntensity: number

	public constructor(message: BuffMessage) {
		this.id = message.id
		this.card = Core.game.findRenderedCardById(message.cardId)
		this.source = Core.game.findRenderedCardById(message.sourceId)
		this.buffClass = message.buffClass
		this.stackType = message.stackType
		this.cardTribes = message.cardTribes.slice()
		this.buffFeatures = message.buffFeatures.slice()
		this.cardFeatures = message.cardFeatures.slice()

		this.duration = message.duration
		this.intensity = message.intensity
		this.baseDuration = message.baseDuration
		this.baseIntensity = message.baseIntensity
	}

	public addDuration(delta: number): void {
		this.setDuration(this.duration + delta)
	}

	public setDuration(value: number): void {
		this.duration = value
	}

	public addIntensity(delta: number): void {
		this.setIntensity(this.intensity + delta)
	}

	public setIntensity(value: number): void {
		this.intensity = value
	}

	getUnitCostOverride(baseCost: number): number {
		let cost = baseCost
		if (this.buffFeatures.includes(BuffFeature.CARD_CAST_FREE)) {
			cost = 0
		}
		return Math.max(0, cost)
	}
	getSpellCostOverride(baseCost: number): number {
		let cost = baseCost
		if (this.buffFeatures.includes(BuffFeature.SPELL_DISCOUNT_PER_INTENSITY)) {
			cost -= this.intensity
		}
		if (this.buffFeatures.includes(BuffFeature.CARD_CAST_FREE)) {
			cost = 0
		}
		return Math.max(0, cost)
	}
	getUnitMaxPowerOverride(basePower: number): number { return basePower }
}
