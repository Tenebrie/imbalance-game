import { CardBuff } from '../../Buff'
import OpenBuffMessage from './OpenBuffMessage'

export default class OpenCardBuffMessage extends OpenBuffMessage {
	parentId: string

	constructor(buff: CardBuff) {
		super(buff)
		if (!buff.parent) {
			throw new Error(`Trying to create a message for buff ${buff.id} that has no parent.`)
		}
		this.parentId = buff.parent.id
	}
}
