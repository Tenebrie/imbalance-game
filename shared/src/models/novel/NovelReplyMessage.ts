import NovelReply from './NovelReply'

export default class NovelReplyMessage {
	id: string
	text: string

	constructor(value: NovelReply) {
		this.id = value.id
		this.text = value.text
	}
}
