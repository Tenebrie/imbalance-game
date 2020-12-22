import PlayerInGame from '../../PlayerInGame'

export default class PlayerInGameRefMessage {
	public readonly playerId: string

	constructor(playerInGame: PlayerInGame) {
		this.playerId = playerInGame.player.id
	}
}
