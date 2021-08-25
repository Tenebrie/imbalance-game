import Player from './Player'
import Ruleset from './ruleset/Ruleset'
import PlayerGroup, { SourcePlayerGroup } from './PlayerGroup'

export default interface Game {
	id: string
	name: string
	isStarted: boolean
	owner: Player | undefined
	players: PlayerGroup[]
	ruleset: Ruleset
}

export interface SourceGame extends Game {
	players: SourcePlayerGroup[]
}
