import Card from '../Card'
import Buff from '../Buff'
import BuffStackType from '../../enums/BuffStackType'

export default class HiddenBuffMessage implements Buff {
	id: string
	cardId: string
	sourceId: string | null

	card: Card // Unassigned
	source: Card | null // Unassigned
	buffClass: string // Unassigned
	stackType: BuffStackType // Unassigned
	duration: number // Unassigned
	intensity: number // Unassigned
	baseDuration: number // Unassigned
	baseIntensity: number // Unassigned

	constructor(buff: Buff) {
		this.id = buff.id
		this.cardId = buff.card.id
		this.sourceId = buff.source ? buff.source.id : null
	}
}
