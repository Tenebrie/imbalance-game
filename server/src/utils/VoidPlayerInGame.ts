import ServerPlayerInGame from '../libraries/players/ServerPlayerInGame'
import VoidPlayer from './VoidPlayer'
import ServerCardDeck from '../models/game/ServerCardDeck'

let voidPlayerInGame: VoidPlayerInGame

export default class VoidPlayerInGame extends ServerPlayerInGame {
	constructor() {
		super(VoidPlayer.get(), ServerCardDeck.emptyDeck())
	}

	public static get(): VoidPlayerInGame {
		if (!voidPlayerInGame) {
			voidPlayerInGame = new VoidPlayerInGame()
		}
		return voidPlayerInGame
	}
}
