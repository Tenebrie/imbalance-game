import Buff from '../Buff'

export default class HiddenBuffMessage {
	id: string
	cardId: string
	sourceId: string | null

	constructor(buff: Buff) {
		this.id = buff.id
		this.cardId = buff.card.id
		this.sourceId = buff.source ? buff.source.id : null


	}
}
