import uuidv4 from 'uuid/v4'
import ServerPlayer from '../libraries/players/ServerPlayer'

export default class ChatEntry {
	id: string
	sender: ServerPlayer
	message: string

	constructor(sender: ServerPlayer, message: string) {
		this.id = uuidv4()
		this.sender = sender
		this.message = message
	}

	static newInstance(sender: ServerPlayer, message: string): ChatEntry {
		return new ChatEntry(sender, message)
	}
}
