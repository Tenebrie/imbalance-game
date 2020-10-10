import Game from '../Game'
import Player from '../Player'
import PlayerMessage from './PlayerMessage'
import HiddenPlayerInGameMessage from '../network/playerInGame/HiddenPlayerInGameMessage'

export default class GameMessage {
	id: string
	name: string
	isStarted: boolean
	owner: PlayerMessage | null
	players: HiddenPlayerInGameMessage[]

	constructor(game: Game) {
		this.id = game.id
		this.name = game.name
		this.owner = game.owner ? new PlayerMessage(game.owner) : null
		this.isStarted = game.isStarted
		this.players = game.players.map(player => new HiddenPlayerInGameMessage(player))
	}
}
