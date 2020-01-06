import ChatEntry from '../ChatEntry'
import PlayerMessage from './PlayerMessage'

export default class ChatEntryMessage {
	id: string
	sender: PlayerMessage
	message: string

	constructor(chatEntry: ChatEntry) {
		this.id = chatEntry.id
		this.sender = PlayerMessage.fromPlayer(chatEntry.sender)
		this.message = chatEntry.message
	}

	static fromChatEntry(chatEntry: ChatEntry): ChatEntryMessage {
		return new ChatEntryMessage(chatEntry)
	}
}
