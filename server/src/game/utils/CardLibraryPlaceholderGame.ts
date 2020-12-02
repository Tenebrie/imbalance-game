import ServerGame from '../models/ServerGame'

class CardLibraryPlaceholderGame extends ServerGame {
	constructor() {
		super({
			name: 'CardLibrary placeholder game'
		})
	}
}

export default new CardLibraryPlaceholderGame()
