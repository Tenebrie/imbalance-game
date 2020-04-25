import RenderedCard from '@/Pixi/board/RenderedCard'
import BuffStackType from '@shared/enums/BuffStackType'
import BuffMessage from '@shared/models/network/BuffMessage'
import Buff from '@shared/models/Buff'
import Core from '@/Pixi/Core'

export default class ClientBuff implements Buff {
	id: string
	card: RenderedCard
	source: RenderedCard | null
	buffClass: string
	stackType: BuffStackType

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
}
