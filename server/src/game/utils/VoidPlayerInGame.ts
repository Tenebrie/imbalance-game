import ServerPlayerInGame from '../players/ServerPlayerInGame'
import VoidPlayer from './VoidPlayer'
import ServerCardDeck from '../models/ServerCardDeck'
import ServerGame from '../models/ServerGame'

let voidPlayerInGame: VoidPlayerInGame

export default class VoidPlayerInGame extends ServerPlayerInGame {
	constructor(game: ServerGame) {
		super(game, VoidPlayer.get(), ServerCardDeck.emptyDeck(game))
	}

	public static for(game: ServerGame): VoidPlayerInGame {
		if (!voidPlayerInGame) {
			voidPlayerInGame = new VoidPlayerInGame(game)
		}
		return voidPlayerInGame
	}
}
