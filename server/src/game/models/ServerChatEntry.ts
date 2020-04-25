import uuidv4 from 'uuid/v4'
import ChatEntry from '@shared/models/ChatEntry'
import ServerPlayer from '../players/ServerPlayer'

export default class ServerChatEntry extends ChatEntry {
	sender: ServerPlayer

	constructor(sender: ServerPlayer, message: string) {
		super(uuidv4(), sender, message)
	}

	static newInstance(sender: ServerPlayer, message: string): ServerChatEntry {
		return new ServerChatEntry(sender, message)
	}
}
