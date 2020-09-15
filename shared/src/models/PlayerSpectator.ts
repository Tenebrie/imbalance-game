import Player from './Player'
import PlayerInGame from './PlayerInGame'

export default interface PlayerSpectator {
	player: Player
	spectatedPlayer: Player
}
