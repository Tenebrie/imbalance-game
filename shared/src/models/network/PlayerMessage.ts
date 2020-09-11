import Player from '../Player'

export default class PlayerMessage {
	id: string
	username: string

	constructor(player: Player) {
		this.id = player.id
		this.username = player.username
	}
}
