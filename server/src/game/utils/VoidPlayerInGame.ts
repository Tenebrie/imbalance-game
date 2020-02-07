import VoidPlayer from './VoidPlayer'
import ServerGame from '../models/ServerGame'
import ServerPlayerInGame from '../players/ServerPlayerInGame'

let voidPlayerInGame: VoidPlayerInGame

export default class VoidPlayerInGame extends ServerPlayerInGame {
	constructor(game: ServerGame) {
		super(game, VoidPlayer.get())
	}

	public static for(game: ServerGame): VoidPlayerInGame {
		if (!voidPlayerInGame) {
			voidPlayerInGame = new VoidPlayerInGame(game)
		}
		return voidPlayerInGame
	}
}
