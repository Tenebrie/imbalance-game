import Player from './Player'
import PlayerGroup, { SourcePlayerGroup } from './PlayerGroup'
import Ruleset from './ruleset/Ruleset'

export default interface Game {
	id: string
	name: string
	isStarted: boolean
	isSpectatable: boolean
	owner: Player | undefined
	players: PlayerGroup[]
	ruleset: Ruleset
}

export interface SourceGame extends Game {
	players: SourcePlayerGroup[]
}
