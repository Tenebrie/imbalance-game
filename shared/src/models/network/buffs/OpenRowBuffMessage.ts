import { RowBuff } from '../../Buff'
import OpenBuffMessage from './OpenBuffMessage'

export default class OpenRowBuffMessage extends OpenBuffMessage {
	parentIndex: number

	constructor(buff: RowBuff) {
		super(buff)
		if (!buff.parent) {
			throw new Error(`Trying to create a message for buff ${buff.id} that has no parent.`)
		}
		this.parentIndex = buff.parent.index
	}
}
