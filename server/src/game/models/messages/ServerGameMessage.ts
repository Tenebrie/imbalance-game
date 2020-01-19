import ServerGame from '../ServerGame'
import GameMessage from '../../shared/models/network/GameMessage'

export default class ServerGameMessage extends GameMessage {
	public static fromServerGame(game: ServerGame) {
		return new ServerGameMessage(game, game.owner, game.players.length)
	}
}
