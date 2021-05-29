import Buff from '../../Buff'

export default class BuffRefMessage {
	id: string
	cardId: string | null

	constructor(buff: Buff) {
		this.id = buff.id
		this.cardId = buff.card ? buff.card.id : null
	}
}
