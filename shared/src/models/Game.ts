import Player from './Player'
import PlayerInGame from './PlayerInGame'
import Ruleset from './Ruleset'

export default interface Game {
	id: string
	name: string
	isStarted: boolean
	owner: Player | undefined
	players: PlayerInGame[]
	ruleset: Ruleset
}
