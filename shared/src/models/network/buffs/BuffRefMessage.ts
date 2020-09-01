import Buff from '../../Buff'

export default class BuffRefMessage {
	id: string
	cardId: string

	constructor(buff: Buff) {
		this.id = buff.id
		this.cardId = buff.card.id
	}
}
