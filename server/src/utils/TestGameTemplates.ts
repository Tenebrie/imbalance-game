import ServerGame from '../game/models/ServerGame'
import ServerPlayer from '../game/players/ServerPlayer'
import AccessLevel from '@shared/enums/AccessLevel'
import ServerTemplateCardDeck from '../game/models/ServerTemplateCardDeck'
import CardLibrary from '../game/libraries/CardLibrary'
import LeaderVelElleron from '../game/cards/01-arcane/leaders/VelElleron/LeaderVelElleron'

export default {
	emptyDecks(): ServerGame {
		const consoleLog = console.info
		console.info = jest.fn()

		const game = new ServerGame({})
		const playerOne = new ServerPlayer('player-one-id', '123', 'Teppo', AccessLevel.NORMAL)
		const playerTwo = new ServerPlayer('player-two-id', '123', 'Jom', AccessLevel.NORMAL)
		const template = new ServerTemplateCardDeck(CardLibrary.instantiateByConstructor(game, LeaderVelElleron), [], [])
		game.addPlayer(playerOne, template)
		game.addPlayer(playerTwo, template)
		game.start()

		console.info = consoleLog
		return game
	}
}
