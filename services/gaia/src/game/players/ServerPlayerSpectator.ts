import PlayerSpectator from '@shared/models/PlayerSpectator'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'

import ServerGame from '../models/ServerGame'
import ServerPlayer from './ServerPlayer'

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

	public get group(): ServerPlayerGroup {
		return this.spectatedPlayer.playerInGame!.group
	}
}
