import Player from '../Player'

export default class PublicPlayerMessage {
	id: string
	username: string

	constructor(player: Player) {
		this.id = player.id
		this.username = player.username
	}

	static fromPlayer(player: Player): PublicPlayerMessage {
		return new PublicPlayerMessage(player)
	}
}
