import Game from '../Game'
import HiddenPlayerMessage from './player/HiddenPlayerMessage'
import HiddenPlayerInGameMessage from '../network/playerInGame/HiddenPlayerInGameMessage'
import Ruleset from '../Ruleset'

export default class GameMessage {
	id: string
	name: string
	isStarted: boolean
	owner: HiddenPlayerMessage | null
	players: HiddenPlayerInGameMessage[]
	ruleset: Ruleset

	constructor(game: Game) {
		this.id = game.id
		this.name = game.name
		this.owner = game.owner ? new HiddenPlayerMessage(game.owner) : null
		this.isStarted = game.isStarted
		this.players = game.players.map((player) => new HiddenPlayerInGameMessage(player))
		this.ruleset = game.ruleset
	}
}
