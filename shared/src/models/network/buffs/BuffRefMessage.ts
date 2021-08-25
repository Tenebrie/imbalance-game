import Buff from '../../Buff'

export default class BuffRefMessage {
	id: string

	constructor(buff: Buff) {
		this.id = buff.id
	}
}
