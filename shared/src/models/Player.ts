import PlayerMessage from './network/PlayerMessage'

export default class Player {
	id: string
	username: string

	constructor(id: string, username: string) {
		this.id = id
		this.username = username
	}

	public static fromPlayerMessage(playerMessage: PlayerMessage): Player {
		return new Player(playerMessage.id, playerMessage.username)
	}
}
