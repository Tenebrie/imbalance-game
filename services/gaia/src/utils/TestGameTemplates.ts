import AccessLevel from '@shared/enums/AccessLevel'
import ServerEditorDeck from '@src/game/models/ServerEditorDeck'
import TestingRulesetPVPLegacy from '@src/game/rulesets/testing/TestingRulesetPVPLegacy'

import TestingLeader from '../game/cards/11-testing/TestingLeader'
import CardLibrary, { CardConstructor } from '../game/libraries/CardLibrary'
import ServerCard from '../game/models/ServerCard'
import ServerGame, { OptionalGameProps } from '../game/models/ServerGame'
import ServerOwnedCard from '../game/models/ServerOwnedCard'
import ServerPlayer from '../game/players/ServerPlayer'
import ServerPlayerInGame from '../game/players/ServerPlayerInGame'
import { playerAction, startNextRound, startNextTurn } from './TestGameUtils'

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

interface CommonTemplateResult {
	game: ServerGame
	player: ServerPlayerInGame
	opponent: ServerPlayerInGame
	playerAction: (callback: () => void) => void
	startNextTurn: () => void
	startNextRound: () => void
}

type SingleCardTestGameTemplateResult = {
	cardInHand: ServerCard
	ownedCard: ServerOwnedCard
} & CommonTemplateResult

type OpponentCardTestGameTemplateResult = {
	playersCard: ServerCard
	playersOwnedCard: ServerOwnedCard
	opponentsCard: ServerCard
	opponentsOwnedCard: ServerOwnedCard
} & CommonTemplateResult

const getPlayers = () => {
	const playerOne = new ServerPlayer('player-one-id', '123', 'Teppo', AccessLevel.NORMAL, false)
	const playerTwo = new ServerPlayer('player-two-id', '123', 'Jom', AccessLevel.NORMAL, false)
	return {
		playerOne,
		playerTwo,
	}
}

export default {
	emptyDecks(): ServerGame {
		silenceLogging()

		const game = new ServerGame({ ruleset: TestingRulesetPVPLegacy, playerMoveOrderReversed: false })
		const { playerOne, playerTwo } = getPlayers()
		CardLibrary.forceLoadCards([TestingLeader])
		const template = ServerEditorDeck.fromConstructors([TestingLeader])
		game.addHumanPlayer(playerOne, game.players[0], template)
		game.addHumanPlayer(playerTwo, game.players[1], template)
		game.start()
		game.players[0].startRound()
		game.players[1].startRound()
		game.advanceCurrentTurn()

		game.events.resolveEvents()
		game.events.evaluateSelectors()

		return game
	},

	normalGameFlow(props?: Partial<OptionalGameProps>): CommonTemplateResult {
		silenceLogging()
		const game = new ServerGame({ ruleset: TestingRulesetPVPLegacy, playerMoveOrderReversed: false, ...props })
		const { playerOne, playerTwo } = getPlayers()
		CardLibrary.forceLoadCards([TestingLeader])
		const template = ServerEditorDeck.fromConstructors([TestingLeader])
		game.addHumanPlayer(playerOne, game.players[0], template)
		game.addHumanPlayer(playerTwo, game.players[1], template)

		game.start()
		game.players[0].startRound()
		game.players[1].startRound()
		game.advanceCurrentTurn()

		game.events.resolveEvents()
		game.events.evaluateSelectors()

		return {
			game,
			player: game.players[1].players[0],
			opponent: game.players[0].players[0],
			playerAction: playerAction(game),
			startNextTurn: startNextTurn(game),
			startNextRound: startNextRound(game),
		}
	},

	singleCardTest(card: CardConstructor): SingleCardTestGameTemplateResult {
		silenceLogging()
		const game = new ServerGame({ ruleset: TestingRulesetPVPLegacy, playerMoveOrderReversed: false })
		const { playerOne, playerTwo } = getPlayers()
		CardLibrary.forceLoadCards([TestingLeader, card])
		const template = ServerEditorDeck.fromConstructors([TestingLeader])
		game.addHumanPlayer(playerOne, game.players[0], template)
		game.addHumanPlayer(playerTwo, game.players[1], template)

		game.start()
		game.players[0].startRound()
		game.players[1].startRound()
		game.advanceCurrentTurn()

		const player = game.players[1].players[0]
		const cardInHand = new card(game)
		player.setUnitMana(1)
		player.cardHand.addUnit(cardInHand)
		player.group.startTurn()

		game.events.resolveEvents()
		game.events.evaluateSelectors()

		const opponent = game.players[0].players[0]

		return {
			game,
			player,
			opponent,
			cardInHand,
			ownedCard: {
				card: cardInHand,
				owner: player,
			},
			playerAction: playerAction(game),
			startNextTurn: startNextTurn(game),
			startNextRound: startNextRound(game),
		}
	},

	opponentCardTest(playersCard: CardConstructor, opponentsCard: CardConstructor): OpponentCardTestGameTemplateResult {
		silenceLogging()
		const game = new ServerGame({ ruleset: TestingRulesetPVPLegacy, playerMoveOrderReversed: false })
		const { playerOne, playerTwo } = getPlayers()
		CardLibrary.forceLoadCards([TestingLeader])
		const template = ServerEditorDeck.fromConstructors([TestingLeader])
		game.addHumanPlayer(playerOne, game.players[0], template)
		game.addHumanPlayer(playerTwo, game.players[1], template)

		game.start()
		game.players[0].startRound()
		game.players[1].startRound()
		game.advanceCurrentTurn()

		const player = game.players[1].players[0]
		const playersCardInHand = new playersCard(game)
		player.setUnitMana(1)
		player.cardHand.addUnit(playersCardInHand)

		const opponentsCardInHand = new opponentsCard(game)
		player.opponent.players[0].setUnitMana(1)
		player.opponent.players[0].cardHand.addUnit(opponentsCardInHand)

		game.events.resolveEvents()
		game.events.evaluateSelectors()

		return {
			game,
			player: player,
			opponent: game.players[0].players[0],
			playersCard: playersCardInHand,
			playersOwnedCard: {
				card: playersCardInHand,
				owner: player,
			},
			opponentsCard: opponentsCardInHand,
			opponentsOwnedCard: {
				card: opponentsCardInHand,
				owner: player.opponent.players[0],
			},
			playerAction: playerAction(game),
			startNextTurn: startNextTurn(game),
			startNextRound: startNextRound(game),
		}
	},

	leaderTest(playerLeader: CardConstructor, opponentLeader: CardConstructor, props?: OptionalGameProps): CommonTemplateResult {
		silenceLogging()
		const game = new ServerGame({ ruleset: TestingRulesetPVPLegacy, playerMoveOrderReversed: false, ...props })
		const { playerOne, playerTwo } = getPlayers()
		CardLibrary.forceLoadCards([playerLeader, opponentLeader])
		const playerTemplate = ServerEditorDeck.fromConstructors([playerLeader])
		const opponentTemplate = ServerEditorDeck.fromConstructors([opponentLeader])
		game.addHumanPlayer(playerOne, game.players[0], playerTemplate)
		game.addHumanPlayer(playerTwo, game.players[1], opponentTemplate)

		game.start()
		game.players[0].startRound()
		game.players[1].startRound()
		game.advanceCurrentTurn()

		game.events.resolveEvents()
		game.events.evaluateSelectors()

		return {
			game,
			player: game.players[1].players[0],
			opponent: game.players[0].players[0],
			playerAction: playerAction(game),
			startNextTurn: startNextTurn(game),
			startNextRound: startNextRound(game),
		}
	},
}
