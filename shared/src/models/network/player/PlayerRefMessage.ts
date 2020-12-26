import Player from '../../Player'

export default class PlayerRefMessage {
	public readonly id: string

	constructor(player: Player) {
		this.id = player.id
	}
}
