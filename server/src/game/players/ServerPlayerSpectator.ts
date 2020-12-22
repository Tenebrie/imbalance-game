import ServerPlayer from './ServerPlayer'
import ServerGame from '../models/ServerGame'
import PlayerSpectator from '@shared/models/PlayerSpectator'

export default class ServerPlayerSpectator implements PlayerSpectator {
	initialized = false

	game: ServerGame
	player: ServerPlayer
	spectatedPlayer: ServerPlayer

	constructor(game: ServerGame, player: ServerPlayer, spectatedPlayer: ServerPlayer) {
		this.game = game
		this.player = player
		this.spectatedPlayer = spectatedPlayer
	}
}
