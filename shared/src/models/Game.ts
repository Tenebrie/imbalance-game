import Player from './Player'
import PlayerInGame from './PlayerInGame'

export default interface Game {
	id: string
	name: string
	isStarted: boolean
	owner: Player
	players: PlayerInGame[]
}
