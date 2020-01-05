import ServerPlayer from '../../libraries/players/ServerPlayer'

export default class PlayerMessage {
	id: string
	username: string

	constructor(player: ServerPlayer) {
		this.id = player.id
		this.username = player.username
	}

	static fromPlayer(player: ServerPlayer): PlayerMessage {
		return new PlayerMessage(player)
	}
}
