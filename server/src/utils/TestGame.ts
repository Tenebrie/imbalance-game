import AccessLevel from '@shared/enums/AccessLevel'
import AIBehaviour from '@shared/enums/AIBehaviour'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import LeaderStatType from '@shared/enums/LeaderStatType'
import RichTextVariables from '@shared/models/RichTextVariables'
import AsciiColor from '@src/enums/AsciiColor'
import ServerBotPlayer from '@src/game/AI/ServerBotPlayer'
import { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
import { BuffConstructor } from '@src/game/models/buffs/ServerBuffContainer'
import ServerBoardRow from '@src/game/models/ServerBoardRow'
import ServerCardStats from '@src/game/models/ServerCardStats'
import ServerEditorDeck from '@src/game/models/ServerEditorDeck'
import ServerUnit from '@src/game/models/ServerUnit'
import Keywords from '@src/utils/Keywords'
import { colorize, getClassFromConstructor, getTotalLeaderStat } from '@src/utils/Utils'
import { v4 as getRandomId } from 'uuid'

import TestingLeader from '../game/cards/11-testing/TestingLeader'
import CardLibrary, { CardConstructor } from '../game/libraries/CardLibrary'
import ServerCard from '../game/models/ServerCard'
import ServerGame from '../game/models/ServerGame'
import ServerOwnedCard from '../game/models/ServerOwnedCard'
import ServerPlayer from '../game/players/ServerPlayer'
import ServerPlayerInGame from '../game/players/ServerPlayerInGame'

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
	advanceTurn(): TestGame
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

	const advanceTurn = (): TestGame => {
		game.players.filter((group) => !group.turnEnded).forEach((group) => group.endTurn())
		game.advanceCurrentTurn()
		game.events.resolveEvents()
		game.events.evaluateSelectors()
		return gameWrapper
	}

	const gameWrapper = {
		handle: game,
		board: boardWrapper,
		stack: stackWrapper,
		player: playerWrappers[0][0],
		opponent: playerWrappers[1][0],
		allPlayers: playerWrappers,
		advanceTurn,
	}
	return gameWrapper
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

/**
 * Board row wrapper
 */

type TestGameRow = {
	buffs: TestGameBuffs
}

const wrapRow = (game: ServerGame, row: ServerBoardRow): TestGameRow => {
	return {
		buffs: wrapBuffs(game, row),
	}
}

/**
 * Unit wrapper
 */

type TestGameUnit = {
	stats: ServerCardStats
	buffs: TestGameBuffs
	variables: RichTextVariables
	getRow(): RowDistanceWrapper
	orderOnFirst(): void
}

const wrapUnit = (game: ServerGame, unit: ServerUnit): TestGameUnit => {
	return {
		stats: unit.card.stats,
		buffs: wrapBuffs(game, unit.card),
		variables: unit.card.variables,
		getRow: () => wrapRowDistance(unit),
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
 * Player wrapper
 */
type TestGamePlayer = {
	handle: ServerPlayerInGame
	add(card: CardConstructor): TestGameCard
	draw(card: CardConstructor): TestGameCard
	summon(card: CardConstructor, row?: RowDistanceWrapper): TestGameUnit
	getSpellMana(): number
	addSpellMana(value: number): void
	find(card: CardConstructor): TestGameCard
	findAt(card: CardConstructor, index: number): TestGameCard
	getStack(): TestGameCardPlayActions
	getFrontRow(): TestGameRow
	getLeaderStat(stat: LeaderStatType): number
	graveyard: {
		add(card: CardConstructor): TestGameCard
	}
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

	const addCardToHand = (player: ServerPlayerInGame, cardConstructor: CardConstructor): TestGameCard => {
		const card = Keywords.addCardToHand.for(player).fromConstructor(cardConstructor)
		return wrapCard(game, card, player)
	}

	const drawCardToHand = (player: ServerPlayerInGame, cardConstructor: CardConstructor): TestGameCard => {
		const card = player.cardDeck.findCard(cardConstructor)
		if (!card) {
			throw new Error(`Unable to draw card ${getClassFromConstructor(cardConstructor)}`)
		}
		return wrapCard(game, Keywords.drawExactCard(player, card), player)
	}

	const findCardAnywhere = (player: ServerPlayerInGame, cardConstructor: CardConstructor, index: number): TestGameCard => {
		const game = player.game
		const allCards = player.cardHand.allCards
			.concat(player.cardDeck.allCards)
			.concat(player.cardGraveyard.allCards)
			.concat(game.board.getUnitsOwnedByPlayer(player).map((unit) => unit.card))
			.concat(game.cardPlay.cardResolveStack.cards.filter((ownedCard) => ownedCard.owner === player).map((ownedCard) => ownedCard.card))
		const foundCards = allCards.filter((card) => card.class === getClassFromConstructor(cardConstructor))
		if (foundCards.length <= index) {
			throw new Error(
				`Unable to find ${getClassFromConstructor(cardConstructor)} at index ${index}. Only ${foundCards.length} cards found.`
			)
		}
		return wrapCard(game, foundCards[index], player)
	}

	const summon = (player: ServerPlayerInGame, cardConstructor: CardConstructor, row: RowDistanceWrapper): TestGameUnit => {
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

	const getFrontRow = (player: ServerPlayerInGame): TestGameRow => {
		return wrapRow(game, game.board.getRowWithDistanceToFront(player, 0))
	}

	const addCardToGraveyard = (player: ServerPlayerInGame, cardConstructor: CardConstructor): TestGameCard => {
		const card = Keywords.addCardToGraveyard(player, cardConstructor)
		return wrapCard(game, card, player)
	}

	return game.players.map((playerGroup) =>
		playerGroup.players.map((player) => ({
			handle: player,
			add: (card: CardConstructor) => addCardToHand(player, card),
			draw: (card: CardConstructor) => drawCardToHand(player, card),
			find: (card: CardConstructor) => findCardAnywhere(player, card, 0),
			findAt: (card: CardConstructor, index: number) => findCardAnywhere(player, card, index),
			summon: (card: CardConstructor, row: RowDistanceWrapper = 'front') => summon(player, card, row),
			getSpellMana: (): number => player.spellMana,
			addSpellMana: (value: number) => addSpellMana(player, value),
			getStack: () => getCardPlayActions(game, player),
			getFrontRow: () => getFrontRow(player),
			getLeaderStat: (stat: LeaderStatType) => getTotalLeaderStat(player, [stat]),
			graveyard: {
				add: (card: CardConstructor) => addCardToGraveyard(player, card),
			},
		}))
	)
}

/**
 * Card wrapper
 */
type TestGameCard = {
	stats: ServerCardStats
	buffs: TestGameBuffs
	location: CardLocation
	play(): TestGameCardPlayActions
	playTo(row: 'front' | 'middle' | 'back'): TestGameCardPlayActions
}

const wrapCard = (game: ServerGame, card: ServerCard, player: ServerPlayerInGame): TestGameCard => {
	const playCardToRow = (row: RowDistanceWrapper): TestGameCardPlayActions => {
		const distance = unwrapRowDistance(row, game, player)
		const rowOwner = card.features.includes(CardFeature.SPY) ? player.opponent : player
		const targetRow = game.board.getRowWithDistanceToFront(rowOwner, distance)
		if (player.unitMana < card.stats.unitCost || player.spellMana < card.stats.spellCost) {
			warn(`Attempting to play a card without enough mana. The action is likely to be ignored.`)
		}
		game.cardPlay.playCardAsPlayerAction(new ServerOwnedCard(card, player), targetRow.index, targetRow.cards.length)
		game.events.resolveEvents()
		game.events.evaluateSelectors()
		return getCardPlayActions(game, player)
	}
	return {
		stats: card.stats,
		buffs: wrapBuffs(game, card),
		location: card.location,
		play: () => playCardToRow('front'),
		playTo: (row: RowDistanceWrapper) => playCardToRow(row),
	}
}

/**
 * Card buff wrapper
 */
type TestGameBuffs = {
	add(buffConstructor: BuffConstructor): void
	addMultiple(buffConstructor: BuffConstructor, count: number): void
	has(buffConstructor: BuffConstructor): boolean
}

const wrapBuffs = (game: ServerGame, parent: ServerCard | ServerBoardRow): TestGameBuffs => {
	return {
		add: (buffConstructor): void => parent.buffs.add(buffConstructor, null),
		addMultiple: (buffConstructor, count): void => parent.buffs.addMultiple(buffConstructor, count, null),
		has: (buffConstructor): boolean => parent.buffs.has(buffConstructor),
	}
}

/**
 * Play stack wrapper
 */
type TestGamePlayStack = {
	log(): void
	countAll(): number
}

const setupCardPlayStack = (game: ServerGame): TestGamePlayStack => {
	return {
		log: () => {
			console.debug(game.cardPlay.cardResolveStack.cards.map((card) => card.card.class))
		},
		countAll: () => {
			return game.cardPlay.cardResolveStack.cards.length
		},
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
type RowDistanceWrapper = 'front' | 'middle' | 'back' | 'enemy'
const wrapRowDistance = (unit: ServerUnit): RowDistanceWrapper => {
	const game = unit.game
	const group = unit.owner
	const distance = game.board.getDistanceToFront(group, unit.rowIndex)
	switch (distance) {
		case 0:
			return 'front'
		case 1:
			return 'middle'
		case 2:
			return 'back'
		default:
			throw new Error(`Unknown row type with distance ${distance}`)
	}
}
const unwrapRowDistance = (index: RowDistanceWrapper, game: ServerGame, player: ServerPlayerInGame): number => {
	return index === 'front' ? 0 : index === 'middle' ? 1 : game.board.getControlledRows(player).length - 1
}

const warn = (message: string): void => {
	console.debug(`${colorize('[Warning]', AsciiColor.YELLOW)} ${message}`)
}

const silenceLogging = (): void => {
	console.info = jest.fn()
	console.warn = jest.fn()
	console.error = jest.fn()
}
