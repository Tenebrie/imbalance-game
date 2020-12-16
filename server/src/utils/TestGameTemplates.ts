import ServerGame from '../game/models/ServerGame'
import ServerPlayer from '../game/players/ServerPlayer'
import AccessLevel from '@shared/enums/AccessLevel'
import ServerTemplateCardDeck from '../game/models/ServerTemplateCardDeck'
import CardLibrary, {CardConstructor} from '../game/libraries/CardLibrary'
import LeaderVelElleron from '../game/cards/01-arcane/leaders/VelElleron/LeaderVelElleron'
import ServerPlayerInGame from '../game/players/ServerPlayerInGame'
import ServerCard from '../game/models/ServerCard'
import HeroAdventuringGuildMaster from '../game/cards/09-neutral/epic/HeroAdventuringGuildMaster'
import GameMode from '@shared/enums/GameMode'

const consoleInfo = console.info
const consoleWarn = console.warn
const consoleError = console.error

export const silenceLogging = (): void => {
	console.info = jest.fn()
	console.warn = jest.fn()
	console.error = jest.fn()
}

export const resumeLogging = (): void => {
	console.info = consoleInfo
	console.warn = consoleWarn
	console.error = consoleError
}

interface TestGameTemplateResult {
	game: ServerGame
	cardInHand: ServerCard
	player: ServerPlayerInGame
}

export default {
	emptyDecks(): ServerGame {
		silenceLogging()
		const game = new ServerGame({ gameMode: GameMode.VS_AI }, )
		const playerOne = new ServerPlayer('player-one-id', '123', 'Teppo', AccessLevel.NORMAL)
		const playerTwo = new ServerPlayer('player-two-id', '123', 'Jom', AccessLevel.NORMAL)
		const template = new ServerTemplateCardDeck(CardLibrary.instantiateByConstructor(game, LeaderVelElleron), [], [])
		game.addPlayer(playerOne, template)
		game.addPlayer(playerTwo, template)
		game.start()
		resumeLogging()
		return game
	},

	singleCardTest(card: CardConstructor): TestGameTemplateResult {
		silenceLogging()
		const game = new ServerGame({ gameMode: GameMode.VS_AI })
		const playerOne = new ServerPlayer('player-one-id', '123', 'Teppo', AccessLevel.NORMAL)
		const playerTwo = new ServerPlayer('player-two-id', '123', 'Jom', AccessLevel.NORMAL)
		const template = new ServerTemplateCardDeck(CardLibrary.instantiateByConstructor(game, LeaderVelElleron), [], [])
		game.addPlayer(playerOne, template)
		game.addPlayer(playerTwo, template)

		const player = game.players[1]
		const cardInHand = new card(game)
		player.setUnitMana(1)
		player.cardHand.addUnit(cardInHand)

		game.start()
		resumeLogging()
		return {
			game,
			player,
			cardInHand
		}
	}
}
