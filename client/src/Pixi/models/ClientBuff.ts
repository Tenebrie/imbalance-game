import RenderedCard from '@/Pixi/cards/RenderedCard'
import BuffStackType from '@shared/enums/BuffStackType'
import Buff from '@shared/models/Buff'
import Core from '@/Pixi/Core'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import BuffFeature from '@shared/enums/BuffFeature'
import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffMessage from '@shared/models/network/buffs/BuffMessage'

export default class ClientBuff implements Buff {
	id: string
	card: RenderedCard
	source: RenderedCard | null
	buffClass: string
	alignment: BuffAlignment
	stackType: BuffStackType
	cardTribes: CardTribe[]
	buffFeatures: BuffFeature[]
	cardFeatures: CardFeature[]

	name: string
	description: string

	duration: number
	intensity: number
	baseDuration: number
	baseIntensity: number

	public constructor(message: BuffMessage) {
		this.id = message.id
		this.card = Core.game.findRenderedCardById(message.cardId)
		this.source = Core.game.findRenderedCardById(message.sourceId)
		this.buffClass = message.buffClass
		this.alignment = message.alignment
		this.stackType = message.stackType
		this.cardTribes = (message.cardTribes || []).slice()
		this.buffFeatures = (message.buffFeatures || []).slice()
		this.cardFeatures = (message.cardFeatures || []).slice()

		this.name = message.name
		this.description = message.description

		this.duration = Number(message.duration)
		this.intensity = Number(message.intensity)
		this.baseDuration = Number(message.baseDuration)
		this.baseIntensity = Number(message.baseIntensity)
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
}
