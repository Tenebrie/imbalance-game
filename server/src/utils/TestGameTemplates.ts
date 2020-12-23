import ServerGame from '../game/models/ServerGame'
import ServerPlayer from '../game/players/ServerPlayer'
import AccessLevel from '@shared/enums/AccessLevel'
import ServerTemplateCardDeck from '../game/models/ServerTemplateCardDeck'
import CardLibrary, { CardConstructor } from '../game/libraries/CardLibrary'
import ServerPlayerInGame from '../game/players/ServerPlayerInGame'
import ServerCard from '../game/models/ServerCard'
import GameMode from '@shared/enums/GameMode'
import ServerOwnedCard from '../game/models/ServerOwnedCard'
import TestingLeader from '../game/cards/11-testing/TestingLeader'

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

interface singleCardTestGameTemplateResult {
	game: ServerGame
	cardInHand: ServerCard
	player: ServerPlayerInGame
	ownedCard: ServerOwnedCard
}

interface opponentCardTestGameTemplateResult {
	game: ServerGame
	player: ServerPlayerInGame
	playersCard: ServerCard
	playersOwnedCard: ServerOwnedCard
	opponentsCard: ServerCard
	opponentsOwnedCard: ServerOwnedCard
}

export default {
	emptyDecks(): ServerGame {
		silenceLogging()
		const game = new ServerGame({ gameMode: GameMode.VS_AI })
		const playerOne = new ServerPlayer('player-one-id', '123', 'Teppo', AccessLevel.NORMAL)
		const playerTwo = new ServerPlayer('player-two-id', '123', 'Jom', AccessLevel.NORMAL)
		const template = new ServerTemplateCardDeck(CardLibrary.instantiateByConstructor(game, TestingLeader), [], [])
		game.addPlayer(playerOne, template)
		game.addPlayer(playerTwo, template)
		game.start()
		return game
	},

	singleCardTest(card: CardConstructor): singleCardTestGameTemplateResult {
		silenceLogging()
		const game = new ServerGame({ gameMode: GameMode.VS_AI })
		const playerOne = new ServerPlayer('player-one-id', '123', 'Teppo', AccessLevel.NORMAL)
		const playerTwo = new ServerPlayer('player-two-id', '123', 'Jom', AccessLevel.NORMAL)
		const template = new ServerTemplateCardDeck(CardLibrary.instantiateByConstructor(game, TestingLeader), [], [])
		game.addPlayer(playerOne, template)
		game.addPlayer(playerTwo, template)

		const player = game.players[1]
		const cardInHand = new card(game)
		player.setUnitMana(1)
		player.cardHand.addUnit(cardInHand)

		game.start()
		return {
			game,
			player,
			cardInHand,
			ownedCard: {
				card: cardInHand,
				owner: player,
			},
		}
	},

	opponentCardTest(playersCard: CardConstructor, opponentsCard: CardConstructor): opponentCardTestGameTemplateResult {
		silenceLogging()
		const game = new ServerGame({ gameMode: GameMode.VS_AI })
		const playerOne = new ServerPlayer('player-one-id', '123', 'Teppo', AccessLevel.NORMAL)
		const playerTwo = new ServerPlayer('player-two-id', '123', 'Jom', AccessLevel.NORMAL)
		const template = new ServerTemplateCardDeck(CardLibrary.instantiateByConstructor(game, TestingLeader), [], [])
		game.addPlayer(playerOne, template)
		game.addPlayer(playerTwo, template)

		const player = game.players[1]
		const playersCardInHand = new playersCard(game)
		player.setUnitMana(1)
		player.cardHand.addUnit(playersCardInHand)

		const opponentsCardInHand = new opponentsCard(game)
		player.opponentInGame.setUnitMana(1)
		player.opponentInGame.cardHand.addUnit(opponentsCardInHand)

		game.start()
		return {
			game,
			player,
			playersCard: playersCardInHand,
			playersOwnedCard: {
				card: playersCardInHand,
				owner: player,
			},
			opponentsCard: opponentsCardInHand,
			opponentsOwnedCard: {
				card: opponentsCardInHand,
				owner: player.opponentInGame,
			},
		}
	},
}
