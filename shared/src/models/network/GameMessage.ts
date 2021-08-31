import { SourceGame } from '../Game'
import RulesetMessage from '../ruleset/messages/RulesetMessage'
import HiddenPlayerMessage from './player/HiddenPlayerMessage'
import HiddenPlayerGroupMessage from './playerGroup/HiddenPlayerGroupMessage'

export default class GameMessage {
	id: string
	name: string
	isStarted: boolean
	isSpectatable: boolean
	owner: HiddenPlayerMessage | null
	players: HiddenPlayerGroupMessage[]
	ruleset: RulesetMessage

	constructor(game: SourceGame) {
		this.id = game.id
		this.name = game.name
		this.owner = game.owner ? new HiddenPlayerMessage(game.owner) : null
		this.isStarted = game.isStarted
		this.isSpectatable = game.isSpectatable
		this.players = game.players.map((player) => new HiddenPlayerGroupMessage(player))
		this.ruleset = new RulesetMessage(game.ruleset)
	}
}
