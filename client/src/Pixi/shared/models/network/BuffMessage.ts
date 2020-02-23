import Buff from '../Buff'
import BuffStackType from '../../enums/BuffStackType'
import Card from '../Card'

export default class BuffMessage implements Buff {
	id: string
	cardId: string
	sourceId: string | null
	buffClass: string
	stackType: BuffStackType

	duration: number
	intensity: number
	baseDuration: number
	baseIntensity: number

	card: Card // Unassigned
	source: Card | null // Unassigned

	constructor(buff: Buff) {
		this.id = buff.id
		this.cardId = buff.card.id
		this.sourceId = buff.source ? buff.source.id : null
		this.buffClass = buff.buffClass
		this.stackType = buff.stackType

		this.duration = buff.duration
		this.intensity = buff.intensity
		this.baseDuration = buff.baseDuration
		this.baseIntensity = buff.baseIntensity
	}
}
