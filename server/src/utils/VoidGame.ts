import ServerGame from '../libraries/game/ServerGame'
import VoidPlayer from './VoidPlayer'

let voidGame: VoidGame

export default class VoidGame extends ServerGame {
	constructor() {
		super(VoidPlayer.get(), 'Void game')
	}

	public static get(): VoidGame {
		if (!voidGame) {
			voidGame = new VoidGame()
		}
		return voidGame
	}
}
