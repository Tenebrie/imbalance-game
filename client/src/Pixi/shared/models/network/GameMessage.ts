import Game from '../Game'
import Player from '../Player'

export default class GameMessage {
	id: string
	name: string
	owner: string
	playerCount: number

	constructor(game: Game, owner: Player, playerCount: number) {
		this.id = game.id
		this.name = game.name
		this.owner = owner.username
		this.playerCount = playerCount
	}
}
