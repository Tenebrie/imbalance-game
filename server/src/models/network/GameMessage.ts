import ServerGame from '../../libraries/game/ServerGame'

export default class GameMessage {
	id: string
	name: string
	owner: string
	playerCount: number

	constructor(game: ServerGame) {
		this.id = game.id
		this.name = game.name
		this.owner = game.owner.username
		this.playerCount = game.players.length
	}

	static fromGame(game: ServerGame): GameMessage {
		return new GameMessage(game)
	}
}
