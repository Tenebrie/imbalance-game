import ServerGame, { OptionalGameProps } from '../game/models/ServerGame'
import ServerPlayer from '../game/players/ServerPlayer'
import AccessLevel from '@shared/enums/AccessLevel'
import ServerTemplateCardDeck from '../game/models/ServerTemplateCardDeck'
import CardLibrary, { CardConstructor } from '../game/libraries/CardLibrary'
import ServerPlayerInGame from '../game/players/ServerPlayerInGame'
import ServerCard from '../game/models/ServerCard'
import GameMode from '@shared/enums/GameMode'
import ServerOwnedCard from '../game/models/ServerOwnedCard'
import TestingLeader from '../game/cards/11-testing/TestingLeader'
import { playerAction, startNextRound, startNextTurn } from './TestGameUtils'
import { ServerRulesetBuilder } from '@src/game/models/rulesets/ServerRulesetBuilder'
import RulesetCategory from '@src/../../shared/src/enums/RulesetCategory'
import ServerEditorDeck from '@src/game/models/ServerEditorDeck'

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

		const ruleset = new ServerRulesetBuilder({ gameMode: GameMode.PVE, category: RulesetCategory.PVE }).__build()
		const game = new ServerGame({ ruleset, playerMoveOrderReversed: false })
		const { playerOne, playerTwo } = getPlayers()
		CardLibrary.forceLoadCards([TestingLeader])
		const template = ServerEditorDeck.fromConstructors([TestingLeader])
		game.addPlayer(playerOne, template)
		game.addPlayer(playerTwo, template)
		game.start()
		game.players[0].startRound()
		game.players[1].startRound()
		game.advanceCurrentTurn()

		game.events.resolveEvents()
		game.events.evaluateSelectors()

		return game
	},

	normalGameFlow(props?: OptionalGameProps): CommonTemplateResult {
		silenceLogging()
		const ruleset = new ServerRulesetBuilder({ gameMode: GameMode.PVE, category: RulesetCategory.PVE }).__build()
		const game = new ServerGame({ ruleset, playerMoveOrderReversed: false, ...props })
		const { playerOne, playerTwo } = getPlayers()
		CardLibrary.forceLoadCards([TestingLeader])
		const template = ServerEditorDeck.fromConstructors([TestingLeader])
		game.addPlayer(playerOne, template)
		game.addPlayer(playerTwo, template)

		game.start()
		game.players[0].startRound()
		game.players[1].startRound()
		game.advanceCurrentTurn()

		game.events.resolveEvents()
		game.events.evaluateSelectors()

		return {
			game,
			player: game.players[1],
			playerAction: playerAction(game),
			startNextTurn: startNextTurn(game),
			startNextRound: startNextRound(game),
		}
	},

	singleCardTest(card: CardConstructor): SingleCardTestGameTemplateResult {
		silenceLogging()
		const ruleset = new ServerRulesetBuilder({ gameMode: GameMode.PVE, category: RulesetCategory.PVE }).__build()
		const game = new ServerGame({ ruleset, playerMoveOrderReversed: false })
		const { playerOne, playerTwo } = getPlayers()
		CardLibrary.forceLoadCards([TestingLeader, card])
		const template = ServerEditorDeck.fromConstructors([TestingLeader])
		game.addPlayer(playerOne, template)
		game.addPlayer(playerTwo, template)

		game.start()
		game.players[0].startRound()
		game.players[1].startRound()
		game.advanceCurrentTurn()

		const player = game.players[1]
		const cardInHand = new card(game)
		player.setUnitMana(1)
		player.cardHand.addUnit(cardInHand)

		game.events.resolveEvents()
		game.events.evaluateSelectors()

		return {
			game,
			player,
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
		const ruleset = new ServerRulesetBuilder({ gameMode: GameMode.PVE, category: RulesetCategory.PVE }).__build()
		const game = new ServerGame({ ruleset, playerMoveOrderReversed: false })
		const { playerOne, playerTwo } = getPlayers()
		CardLibrary.forceLoadCards([TestingLeader])
		const template = ServerEditorDeck.fromConstructors([TestingLeader])
		game.addPlayer(playerOne, template)
		game.addPlayer(playerTwo, template)

		game.start()
		game.players[0].startRound()
		game.players[1].startRound()
		game.advanceCurrentTurn()

		const player = game.players[1]
		const playersCardInHand = new playersCard(game)
		player.setUnitMana(1)
		player.cardHand.addUnit(playersCardInHand)

		const opponentsCardInHand = new opponentsCard(game)
		player.opponentInGame.setUnitMana(1)
		player.opponentInGame.cardHand.addUnit(opponentsCardInHand)

		game.events.resolveEvents()
		game.events.evaluateSelectors()

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
			playerAction: playerAction(game),
			startNextTurn: startNextTurn(game),
			startNextRound: startNextRound(game),
		}
	},

	leaderTest(playerLeader: CardConstructor, opponentLeader: CardConstructor, props?: OptionalGameProps): CommonTemplateResult {
		silenceLogging()
		const ruleset = new ServerRulesetBuilder({ gameMode: GameMode.PVE, category: RulesetCategory.PVE }).__build()
		const game = new ServerGame({ ruleset, playerMoveOrderReversed: false, ...props })
		const { playerOne, playerTwo } = getPlayers()
		CardLibrary.forceLoadCards([playerLeader, opponentLeader])
		const playerTemplate = ServerEditorDeck.fromConstructors([playerLeader])
		const opponentTemplate = ServerEditorDeck.fromConstructors([opponentLeader])
		game.addPlayer(playerOne, playerTemplate)
		game.addPlayer(playerTwo, opponentTemplate)

		game.start()
		game.players[0].startRound()
		game.players[1].startRound()
		game.advanceCurrentTurn()

		game.events.resolveEvents()
		game.events.evaluateSelectors()

		return {
			game,
			player: game.players[1],
			playerAction: playerAction(game),
			startNextTurn: startNextTurn(game),
			startNextRound: startNextRound(game),
		}
	},
}
