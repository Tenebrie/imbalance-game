import Player from './Player'
import PlayerInGame from './PlayerInGame'
import GameMode from "../enums/GameMode";

export default interface Game {
	id: string
	name: string
	isStarted: boolean
	gameMode: GameMode
	owner: Player | undefined
	players: PlayerInGame[]
}
