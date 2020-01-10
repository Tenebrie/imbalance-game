import PlayerInGame from '../PlayerInGame'
import PlayerMessage from './PlayerMessage'

export default class PlayerInGameMessage {
	player: PlayerMessage
	timeUnits: number

	constructor(playerInGame: PlayerInGame) {
		this.player = PlayerMessage.fromPlayer(playerInGame.player)
		this.timeUnits = playerInGame.timeUnits
	}

	static fromPlayerInGame(playerInGame: PlayerInGame): PlayerInGameMessage {
		return new PlayerInGameMessage(playerInGame)
	}
}
