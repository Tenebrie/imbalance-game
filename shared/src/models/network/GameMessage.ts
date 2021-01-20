import Game from '../Game'
import HiddenPlayerInGameMessage from '../network/playerInGame/HiddenPlayerInGameMessage'
import HiddenPlayerMessage from './player/HiddenPlayerMessage'
import GameMode from "../../enums/GameMode";

export default class GameMessage {
	id: string
	name: string
	isStarted: boolean
	gameMode: GameMode
	owner: HiddenPlayerMessage | null
	players: HiddenPlayerInGameMessage[]

	constructor(game: Game) {
		this.id = game.id
		this.name = game.name
		this.owner = game.owner ? new HiddenPlayerMessage(game.owner) : null
		this.gameMode = game.gameMode
		this.isStarted = game.isStarted
		this.players = game.players.map((player) => new HiddenPlayerInGameMessage(player))
	}
}
