import ServerGame from '../game/models/ServerGame'
import ServerPlayer from '../game/players/ServerPlayer'
import AccessLevel from '@shared/enums/AccessLevel'
import CardLibrary, { CardConstructor } from '../game/libraries/CardLibrary'
import ServerPlayerInGame from '../game/players/ServerPlayerInGame'
import ServerCard from '../game/models/ServerCard'
import ServerOwnedCard from '../game/models/ServerOwnedCard'
import TestingLeader from '../game/cards/11-testing/TestingLeader'
import ServerEditorDeck from '@src/game/models/ServerEditorDeck'
import { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
import { v4 as getRandomId } from 'uuid'
import AIBehaviour from '@shared/enums/AIBehaviour'
import ServerBotPlayer from '@src/game/AI/ServerBotPlayer'
import { colorize, getClassFromConstructor } from '@src/utils/Utils'
import Keywords from '@src/utils/Keywords'
import ServerUnit from '@src/game/models/ServerUnit'
import AsciiColor from '@src/enums/AsciiColor'
import ServerCardStats from '@src/game/models/ServerCardStats'
import CardVariablesMessage from '@shared/models/network/CardVariablesMessage'
import RichTextVariables from '@shared/models/RichTextVariables'

/**
 * Game wrapper
 */
export type TestGame = {
	handle: ServerGame
	board: TestGameBoard
	player: TestGamePlayer
	opponent: TestGamePlayer
	allPlayers: TestGamePlayer[][]
}

export const setupTestGame = (ruleset: RulesetConstructor): TestGame => {
	silenceLogging()
	const game = new ServerGame({ ruleset, playerMoveOrderReversed: false })

	const boardWrapper = setupTestGameBoard(game)
	const playerWrappers = setupTestGamePlayers(game)

	game.start()
	game.events.resolveEvents()
	game.events.evaluateSelectors()

	return {
		handle: game,
		board: boardWrapper,
		player: playerWrappers[0][0],
		opponent: playerWrappers[1][0],
		allPlayers: playerWrappers,
	}
}

/**
 * Board wrapper
 */
type TestGameBoard = {
	log: () => void
	find: (card: CardConstructor) => TestGameUnit
	count: (card: CardConstructor) => number
}

type TestGameUnit = {
	stats: ServerCardStats
	variables: RichTextVariables
	orderOnFirst: () => void
}

const setupTestGameBoard = (game: ServerGame): TestGameBoard => {
	return {
		log: (): void => {
			const cards = game.board.rows.map((row) => row.cards.map((unit) => unit.card.class))
			console.debug(cards)
		},
		find: (cardConstructor: CardConstructor): TestGameUnit => {
			const unit = game.board.getAllUnits().find((unit) => unit.card.class === getClassFromConstructor(cardConstructor))
			if (!unit) throw new Error(`Unable to find unit with class ${getClassFromConstructor(cardConstructor)}`)
			return wrapUnit(game, unit)
		},
		count: (cardConstructor: CardConstructor): number => {
			const cardClass = getClassFromConstructor(cardConstructor)
			return game.board.getAllUnits().filter((unit) => unit.card.class === cardClass).length
		},
	}
}

const wrapUnit = (game: ServerGame, unit: ServerUnit): TestGameUnit => {
	return {
		stats: unit.card.stats,
		variables: unit.card.variables,
		orderOnFirst: () => {
			const validOrders = game.board.orders.validOrders.filter((order) => order.definition.card === unit.card)
			const chosenOrder = validOrders[0]
			if (!chosenOrder) throw new Error('No valid orders to perform!')
			game.board.orders.performUnitOrder(chosenOrder, unit.originalOwner)
		},
	}
}

/**
 * Player wrapper
 */
type TestGamePlayer = {
	handle: ServerPlayerInGame
	add: (card: CardConstructor) => ServerCard
	play: (card: CardConstructor, row?: RowIndexWrapper) => void
	spawn: (card: CardConstructor, row?: RowIndexWrapper) => TestGameUnit
}
type RowIndexWrapper = 'front' | 'back'

const setupTestGamePlayers = (game: ServerGame): TestGamePlayer[][] => {
	CardLibrary.forceLoadCards([TestingLeader])
	const deckTemplate = ServerEditorDeck.fromConstructors([TestingLeader])
	game.players.forEach((playerGroup) => {
		while (playerGroup.slots.openHumanSlots > 0) {
			const id = getRandomId()
			const player = new ServerPlayer(`player:id-${id}`, `player-${id}-email`, `player-${id}-username`, AccessLevel.NORMAL, false)
			game.addHumanPlayer(player, playerGroup, deckTemplate)
		}
		while (playerGroup.slots.openBotSlots > 0) {
			const player = new ServerBotPlayer()
			game.addBotPlayer(player, playerGroup, deckTemplate, AIBehaviour.DEFAULT)
		}
	})

	const add = (player: ServerPlayerInGame, cardConstructor: CardConstructor): ServerCard => {
		return Keywords.addCardToHand.for(player).fromConstructor(cardConstructor)
	}

	const play = (player: ServerPlayerInGame, cardConstructor: CardConstructor, row: RowIndexWrapper): void => {
		const distance = row === 'front' ? 0 : game.board.getControlledRows(player).length - 1
		const targetRow = game.board.getRowWithDistanceToFront(player, distance)
		const card = player.cardHand.findCardByConstructor(cardConstructor)
		if (!card) {
			throw new Error(`No card of type ${getClassFromConstructor(cardConstructor)} in player's hand.`)
		}
		if (player.unitMana < card.stats.unitCost || player.spellMana < card.stats.spellCost) {
			warn(`Attempting to play a card without enough mana. The action is likely to be ignored.`)
		}
		game.cardPlay.playCardAsPlayerAction(new ServerOwnedCard(card, player), targetRow.index, targetRow.cards.length)
	}

	const spawn = (player: ServerPlayerInGame, cardConstructor: CardConstructor, row: RowIndexWrapper): TestGameUnit => {
		const distance = row === 'front' ? 0 : game.board.getControlledRows(player).length - 1
		const targetRow = game.board.getRowWithDistanceToFront(player, distance)
		const card = new cardConstructor(game)
		const unit = targetRow.createUnit(card, player, targetRow.cards.length)
		if (!unit) throw new Error('Unable to create the unit')
		return wrapUnit(game, unit)
	}

	return game.players.map((playerGroup) =>
		playerGroup.players.map((player) => ({
			handle: player,
			add: (card: CardConstructor) => add(player, card),
			play: (card: CardConstructor, row: RowIndexWrapper = 'front') => play(player, card, row),
			spawn: (card: CardConstructor, row: RowIndexWrapper = 'front') => spawn(player, card, row),
		}))
	)
}

/**
 * Utilities
 */
const warn = (message: string): void => {
	console.debug(`${colorize('[Warning]', AsciiColor.YELLOW)} ${message}`)
}

const silenceLogging = (): void => {
	console.info = jest.fn()
	console.warn = jest.fn()
	console.error = jest.fn()
}
