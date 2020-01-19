import Player from './Player'

export default class ChatEntry {
	id: string
	sender: Player
	message: string

	constructor(id: string, sender: Player, message: string) {
		this.id = id
		this.sender = sender
		this.message = message
	}
}
