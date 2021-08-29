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
import RichTextVariables from '@shared/models/RichTextVariables'
import { BuffConstructor } from '@src/game/models/buffs/ServerBuffContainer'
import CardLocation from '@shared/enums/CardLocation'

/**
 * Game wrapper
 */
export type TestGame = {
	handle: ServerGame
	board: TestGameBoard
	stack: TestGamePlayStack
	player: TestGamePlayer
	opponent: TestGamePlayer
	allPlayers: TestGamePlayer[][]
}

export const setupTestGame = (ruleset: RulesetConstructor): TestGame => {
	silenceLogging()
	const game = new ServerGame({ ruleset, playerMoveOrderReversed: false })

	const boardWrapper = setupTestGameBoard(game)
	const stackWrapper = setupCardPlayStack(game)
	const playerWrappers = setupTestGamePlayers(game)

	game.start()
	game.events.resolveEvents()
	game.events.evaluateSelectors()

	return {
		handle: game,
		board: boardWrapper,
		stack: stackWrapper,
		player: playerWrappers[0][0],
		opponent: playerWrappers[1][0],
		allPlayers: playerWrappers,
	}
}

/**
 * Board wrapper
 */
type TestGameBoard = {
	log(): void
	find(card: CardConstructor): TestGameUnit
	count(card: CardConstructor): number
	countAll(): number
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
		countAll: (): number => {
			return game.board.getAllUnits().length
		},
	}
}

type TestGameUnit = {
	stats: ServerCardStats
	buffs: TestGameBuffs
	variables: RichTextVariables
	orderOnFirst(): void
}

const wrapUnit = (game: ServerGame, unit: ServerUnit): TestGameUnit => {
	return {
		stats: unit.card.stats,
		buffs: wrapBuffs(game, unit.card),
		variables: unit.card.variables,
		orderOnFirst: () => {
			const validOrders = game.board.orders.validOrders.filter((order) => order.definition.card === unit.card)
			const chosenOrder = validOrders[0]
			if (!chosenOrder) throw new Error('No valid orders to perform!')
			game.board.orders.performUnitOrder(chosenOrder, unit.originalOwner)
			game.events.resolveEvents()
			game.events.evaluateSelectors()
		},
	}
}

/**
 * Play stack wrapper
 */
type TestGamePlayStack = {
	countAll(): number
}

const setupCardPlayStack = (game: ServerGame): TestGamePlayStack => {
	return {
		countAll: () => {
			return game.cardPlay.cardResolveStack.cards.length
		},
	}
}

/**
 * Player wrapper
 */
type TestGamePlayer = {
	handle: ServerPlayerInGame
	add(card: CardConstructor): TestGameCard
	spawn(card: CardConstructor, row?: RowIndexWrapper): TestGameUnit
	addSpellMana(value: number): void
	find(card: CardConstructor): TestGameCard
}
type RowIndexWrapper = 'front' | 'back'

type TestGameCard = {
	buffs: TestGameBuffs
	location: CardLocation
	play(row?: RowIndexWrapper): TestGameCardPlayActions
}

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

	const add = (player: ServerPlayerInGame, cardConstructor: CardConstructor): TestGameCard => {
		const card = Keywords.addCardToHand.for(player).fromConstructor(cardConstructor)
		return wrapCard(game, card, player)
	}

	const find = (player: ServerPlayerInGame, cardConstructor: CardConstructor): TestGameCard => {
		const allCards = player.cardHand.allCards.concat(player.cardDeck.allCards).concat(player.cardGraveyard.allCards)
		const foundCard = allCards.find((card) => card.class === getClassFromConstructor(cardConstructor))
		if (!foundCard) throw new Error(`Unable to find any card with class ${getClassFromConstructor(cardConstructor)}`)
		return wrapCard(game, foundCard, player)
	}

	const spawn = (player: ServerPlayerInGame, cardConstructor: CardConstructor, row: RowIndexWrapper): TestGameUnit => {
		const distance = row === 'front' ? 0 : game.board.getControlledRows(player).length - 1
		const targetRow = game.board.getRowWithDistanceToFront(player, distance)
		const card = new cardConstructor(game)
		const unit = targetRow.createUnit(card, player, targetRow.cards.length)
		if (!unit) throw new Error(`Unable to create the unit with class ${getClassFromConstructor(cardConstructor)}`)
		return wrapUnit(game, unit)
	}

	const addSpellMana = (player: ServerPlayerInGame, value: number): void => {
		player.addSpellMana(value)
	}

	return game.players.map((playerGroup) =>
		playerGroup.players.map((player) => ({
			handle: player,
			add: (card: CardConstructor) => add(player, card),
			find: (card: CardConstructor) => find(player, card),
			spawn: (card: CardConstructor, row: RowIndexWrapper = 'front') => spawn(player, card, row),
			addSpellMana: (value: number) => addSpellMana(player, value),
		}))
	)
}

const wrapCard = (game: ServerGame, card: ServerCard, player: ServerPlayerInGame): TestGameCard => {
	return {
		buffs: wrapBuffs(game, card),
		location: card.location,
		play: (row: RowIndexWrapper = 'front'): TestGameCardPlayActions => {
			const distance = row === 'front' ? 0 : game.board.getControlledRows(player).length - 1
			const targetRow = game.board.getRowWithDistanceToFront(player, distance)
			if (player.unitMana < card.stats.unitCost || player.spellMana < card.stats.spellCost) {
				warn(`Attempting to play a card without enough mana. The action is likely to be ignored.`)
			}
			game.cardPlay.playCardAsPlayerAction(new ServerOwnedCard(card, player), targetRow.index, targetRow.cards.length)
			return getCardPlayActions(game, player)
		},
	}
}

/**
 * Card buff wrapper
 */
type TestGameBuffs = {
	includes(buffConstructor: BuffConstructor): boolean
}

const wrapBuffs = (game: ServerGame, card: ServerCard): TestGameBuffs => {
	return {
		includes: (buffConstructor: BuffConstructor): boolean => card.buffs.has(buffConstructor),
	}
}

/**
 * Play stack action wrapper
 */
type TestGameCardPlayActions = {
	targetFirst(): TestGameCardPlayActions
}

const getCardPlayActions = (game: ServerGame, player: ServerPlayerInGame): TestGameCardPlayActions => {
	const resolvingCard = {
		targetFirst: () => {
			const validTargets = game.cardPlay.getResolvingCardTargets()
			const chosenTarget = validTargets[0]
			if (!chosenTarget) throw new Error('No valid targets!')
			game.cardPlay.selectCardTarget(player, chosenTarget.target)
			game.events.resolveEvents()
			game.events.evaluateSelectors()
			return resolvingCard
		},
	}
	return resolvingCard
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
