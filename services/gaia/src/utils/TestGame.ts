import Constants from '@shared/Constants'
import AccessLevel from '@shared/enums/AccessLevel'
import AIBehaviour from '@shared/enums/AIBehaviour'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import LeaderStatType from '@shared/enums/LeaderStatType'
import RichTextVariables from '@shared/models/RichTextVariables'
import { sortCards } from '@shared/Utils'
import AsciiColor from '@src/enums/AsciiColor'
import ServerBotPlayer from '@src/game/AI/ServerBotPlayer'
import { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
import { BuffConstructor } from '@src/game/models/buffs/ServerBuffContainer'
import ServerBoardRow from '@src/game/models/ServerBoardRow'
import ServerCardStats from '@src/game/models/ServerCardStats'
import { DeployTarget, PlayTarget } from '@src/game/models/ServerCardTargeting'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerEditorDeck from '@src/game/models/ServerEditorDeck'
import ServerUnit from '@src/game/models/ServerUnit'
import Keywords from '@src/utils/Keywords'
import { AnyCardLocation, colorize, getClassFromConstructor, getTotalLeaderStat } from '@src/utils/Utils'
import { v4 as getRandomId } from 'uuid'
import * as ws from 'ws'

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
	advanceRound(): TestGame
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

	const advanceRound = (): TestGame => {
		game.players.filter((group) => !group.roundEnded).forEach((group) => group.endRound())
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
		advanceRound,
	}
	return gameWrapper
}

/**
 * Board wrapper
 */
type TestGameBoard = {
	log(): void
	find(card: CardConstructor): TestGameUnit
	findAt(card: CardConstructor, index: number): TestGameUnit
	count(card: CardConstructor): number
	countAll(): number
}

const setupTestGameBoard = (game: ServerGame): TestGameBoard => {
	const findUnitAtIndex = (cardConstructor: CardConstructor, index: number): TestGameUnit => {
		const units = game.board.getAllUnits().filter((unit) => unit.card.class === getClassFromConstructor(cardConstructor))
		if (units.length === 0) {
			throw new Error(`Unable to find unit with class ${getClassFromConstructor(cardConstructor)}.`)
		}
		const unit = units[index]
		if (!unit) {
			throw new Error(`Unable to find unit with class ${getClassFromConstructor(cardConstructor)} at index ${index}.`)
		}
		return wrapUnit(game, unit)
	}

	return {
		log: (): void => {
			const cards = game.board.rows.map((row) => row.cards.map((unit) => unit.card.class))
			console.debug(cards)
		},
		find: (cardConstructor: CardConstructor) => findUnitAtIndex(cardConstructor, 0),
		findAt: (cardConstructor: CardConstructor, index: number) => findUnitAtIndex(cardConstructor, index),
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
	handle: ServerCard
	stats: ServerCardStats
	buffs: TestGameBuffs
	variables: RichTextVariables
	tribes: CardTribe[]
	getRow(): RowDistanceWrapper
	getRowPosition(): number
	orderOnFirst(): void
	takeDamage(damage: number): TestGameUnit
	takeDamageFromCard(damage: number, source: TestGameCard | TestGameUnit): TestGameUnit
	transformInto(card: CardConstructor): TestGameUnit
	receiveBuffs(buffConstructor: BuffConstructor, count?: number): TestGameUnit
	returnToHand(): TestGameCard
}

const wrapUnit = (game: ServerGame, unit: ServerUnit): TestGameUnit => {
	const orderOnFirst = () => {
		const validOrders = game.board.orders.validOrders.filter((order) => order.definition.card === unit.card)
		const chosenOrder = validOrders[0]
		if (!chosenOrder) throw new Error('No valid orders to perform!')
		game.board.orders.performUnitOrder(chosenOrder, unit.originalOwner)
		game.events.resolveEvents()
		game.events.evaluateSelectors()
	}
	const takeDamage = (damage: number): TestGameUnit => {
		unit.dealDamage(DamageInstance.fromUniverse(damage))
		game.events.resolveEvents()
		game.events.evaluateSelectors()
		return unitWrapper
	}
	const takeDamageFromCard = (damage: number, source: TestGameCard | TestGameUnit): TestGameUnit => {
		unit.dealDamage(DamageInstance.fromCard(damage, source.handle))
		game.events.resolveEvents()
		game.events.evaluateSelectors()
		return unitWrapper
	}
	const transformInto = (card: CardConstructor): TestGameUnit => {
		Keywords.transformUnit(unit, card)
		game.events.resolveEvents()
		game.events.evaluateSelectors()
		return unitWrapper
	}
	const receiveBuffs = (buffConstructor: BuffConstructor, count = 1): TestGameUnit => {
		unit.buffs.addMultiple(buffConstructor, count, null)
		return unitWrapper
	}
	const returnToHand = (): TestGameCard => {
		Keywords.returnCardFromBoardToHand(unit)
		game.events.resolveEvents()
		game.events.evaluateSelectors()
		return wrapCard(game, unit.card, unit.originalOwner)
	}
	const unitWrapper: TestGameUnit = {
		handle: unit.card,
		stats: unit.card.stats,
		buffs: wrapBuffs(game, unit.card),
		variables: unit.card.variables,
		tribes: unit.card.tribes,
		getRow: () => wrapRowDistance(unit),
		getRowPosition: () => unit.unitIndex,
		orderOnFirst: () => orderOnFirst(),
		takeDamage: (damage: number) => takeDamage(damage),
		takeDamageFromCard: takeDamageFromCard,
		transformInto: (card: CardConstructor) => transformInto(card),
		receiveBuffs: (buffConstructor: BuffConstructor, count?: number) => receiveBuffs(buffConstructor, count),
		returnToHand: () => returnToHand(),
	}
	return unitWrapper
}

/**
 * Player wrapper
 */
type TestGamePlayer = {
	handle: ServerPlayerInGame
	add(card: CardConstructor): TestGameCard
	draw(card: CardConstructor): TestGameCard
	summon(card: CardConstructor, row?: RowDistanceWrapper): TestGameUnit
	summonMany(card: CardConstructor, count: number, row?: RowDistanceWrapper): void
	fillRow(card: CardConstructor, row?: RowDistanceWrapper): void
	getUnitMana(): number
	getSpellMana(): number
	addSpellMana(value: number): void
	find(card: CardConstructor): TestGameCard
	findAt(card: CardConstructor, creationIndex: number): TestGameCard
	findAtGameIndex(card: CardConstructor, gameIndex: number): TestGameCard
	findIn(card: CardConstructor, location: CardLocation): TestGameCard
	findInAt(card: CardConstructor, location: CardLocation, creationIndex: number): TestGameCard
	findInAtGameIndex(card: CardConstructor, location: CardLocation, gameIndex: number): TestGameCard
	getStack(): TestGameCardPlayActions
	getFrontRow(): TestGameRow
	getLeaderStat(stat: LeaderStatType): number
	countOnRow(card: CardConstructor, rowIndex: number): number
	deck: {
		add(card: CardConstructor): TestGameCard
	}
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
			player.registerGameConnection((jest.fn() as unknown) as ws, game)
		}
		while (playerGroup.slots.openBotSlots > 0) {
			const player = new ServerBotPlayer()
			game.addBotPlayer(player, playerGroup, deckTemplate, AIBehaviour.DEFAULT)
		}
	})

	const addCardToHand = (player: ServerPlayerInGame, cardConstructor: CardConstructor): TestGameCard => {
		const card = Keywords.addCardToHand.for(player).fromConstructor(cardConstructor)
		game.events.resolveEvents()
		game.events.evaluateSelectors()
		return wrapCard(game, card, player)
	}

	const drawCardToHand = (player: ServerPlayerInGame, cardConstructor: CardConstructor): TestGameCard => {
		const card = player.cardDeck.findCard(cardConstructor)
		if (!card) {
			throw new Error(`Unable to draw card ${getClassFromConstructor(cardConstructor)}`)
		}
		game.events.resolveEvents()
		game.events.evaluateSelectors()
		return wrapCard(game, Keywords.drawExactCard(player, card), player)
	}

	const findCardInLocations = (
		player: ServerPlayerInGame,
		cardConstructor: CardConstructor,
		index: number,
		validLocations: CardLocation[] | 'any',
		sortingOrder: 'code' | 'game'
	): TestGameCard => {
		const game = player.game
		const allCards = player.cardHand.allCards
			.concat(player.cardDeck.allCards)
			.concat(player.cardGraveyard.allCards)
			.concat(game.board.getUnitsOwnedByPlayer(player).map((unit) => unit.card))
			.concat(game.cardPlay.cardResolveStack.cards.filter((ownedCard) => ownedCard.owner === player).map((ownedCard) => ownedCard.card))

		const sortedCards = sortingOrder === 'game' ? sortCards(allCards) : allCards

		const foundCards = sortedCards
			.filter((card) => card.class === getClassFromConstructor(cardConstructor))
			.filter((card) => validLocations === 'any' || validLocations.includes(card.location))
		if (foundCards.length <= index) {
			throw new Error(
				`Unable to find ${getClassFromConstructor(cardConstructor)} at index ${index}. Only ${foundCards.length} cards found.`
			)
		}
		return wrapCard(game, foundCards[index], player)
	}

	const summon = (player: ServerPlayerInGame, cardConstructor: CardConstructor, row: RowDistanceWrapper): TestGameUnit => {
		const distance = unwrapRowDistance(row, game, player)
		const targetRow = game.board.getRowWithDistanceToFront(player, distance)
		const card = new cardConstructor(game)
		const unit = targetRow.createUnit(card, player, targetRow.cards.length)
		if (!unit) throw new Error(`Unable to create the unit with class ${getClassFromConstructor(cardConstructor)}`)
		game.events.resolveEvents()
		game.events.evaluateSelectors()
		return wrapUnit(game, unit)
	}

	const summonMany = (player: ServerPlayerInGame, cardConstructor: CardConstructor, count: number, row: RowDistanceWrapper): void => {
		const distance = unwrapRowDistance(row, game, player)
		const targetRow = game.board.getRowWithDistanceToFront(player, distance)
		for (let i = 0; i < count; i++) {
			const card = new cardConstructor(game)
			const unit = targetRow.createUnit(card, player, targetRow.cards.length)
			if (!unit) throw new Error(`Unable to create the unit with class ${getClassFromConstructor(cardConstructor)}`)
		}
		game.events.resolveEvents()
		game.events.evaluateSelectors()
	}

	const fillRow = (player: ServerPlayerInGame, cardConstructor: CardConstructor, row: RowDistanceWrapper): void => {
		const distance = unwrapRowDistance(row, game, player)
		const targetRow = game.board.getRowWithDistanceToFront(player, distance)
		for (let i = 0; i < Constants.MAX_CARDS_PER_ROW; i++) {
			const card = new cardConstructor(game)
			targetRow.createUnit(card, player, i)
		}
	}

	const addSpellMana = (player: ServerPlayerInGame, value: number): void => {
		player.addSpellMana(value, null)
	}

	const getFrontRow = (player: ServerPlayerInGame): TestGameRow => {
		return wrapRow(game, game.board.getRowWithDistanceToFront(player, 0))
	}

	const countOnRow = (player: ServerPlayerInGame, card: CardConstructor, distance: number): number => {
		const cards = game.board.getRowWithDistanceToFront(player, distance).cards
		return cards.filter((unit) => unit.card.class === getClassFromConstructor(card)).length
	}

	const addCardToDeck = (player: ServerPlayerInGame, cardConstructor: CardConstructor): TestGameCard => {
		const card = Keywords.addCardToDeck(player, cardConstructor)
		game.events.resolveEvents()
		game.events.evaluateSelectors()
		return wrapCard(game, card, player)
	}

	const addCardToGraveyard = (player: ServerPlayerInGame, cardConstructor: CardConstructor): TestGameCard => {
		const card = Keywords.addCardToGraveyard(player, cardConstructor)
		game.events.resolveEvents()
		game.events.evaluateSelectors()
		return wrapCard(game, card, player)
	}

	return game.players.map((playerGroup) =>
		playerGroup.players.map((player) => ({
			handle: player,
			add: (card: CardConstructor) => addCardToHand(player, card),
			draw: (card: CardConstructor) => drawCardToHand(player, card),
			find: (card: CardConstructor) => findCardInLocations(player, card, 0, AnyCardLocation, 'code'),
			findAt: (card: CardConstructor, creationIndex: number) => findCardInLocations(player, card, creationIndex, AnyCardLocation, 'code'),
			findAtGameIndex: (card: CardConstructor, gameIndex: number) => findCardInLocations(player, card, gameIndex, AnyCardLocation, 'game'),
			findIn: (card: CardConstructor, location: CardLocation) => findCardInLocations(player, card, 0, [location], 'code'),
			findInAt: (card: CardConstructor, location: CardLocation, creationIndex: number) =>
				findCardInLocations(player, card, creationIndex, [location], 'code'),
			findInAtGameIndex: (card: CardConstructor, location: CardLocation, gameIndex: number) =>
				findCardInLocations(player, card, gameIndex, [location], 'game'),
			summon: (card: CardConstructor, row: RowDistanceWrapper = 'front') => summon(player, card, row),
			summonMany: (card: CardConstructor, count: number, row: RowDistanceWrapper = 'front') => summonMany(player, card, count, row),
			fillRow: (card: CardConstructor, row: RowDistanceWrapper = 'front') => fillRow(player, card, row),
			getUnitMana: (): number => player.unitMana,
			getSpellMana: (): number => player.spellMana,
			addSpellMana: (value: number) => addSpellMana(player, value),
			getStack: () => getCardPlayActions(game, player),
			getFrontRow: () => getFrontRow(player),
			getLeaderStat: (stat: LeaderStatType) => getTotalLeaderStat(player, [stat]),
			countOnRow: (card: CardConstructor, distance: number) => countOnRow(player, card, distance),
			deck: {
				add: (card: CardConstructor) => addCardToDeck(player, card),
			},
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
	handle: ServerCard
	stats: ServerCardStats
	buffs: TestGameBuffs
	location: CardLocation
	getUnit(): TestGameUnit
	play(): TestGameCardPlayActions
	playTo(row: 'front' | 'middle' | 'back', position: number | 'last'): TestGameCardPlayActions
	takeDamage(damage: number): TestGameCard
	takeDamageFromCard(damage: number, source: TestGameCard | TestGameUnit): TestGameCard
	dealDamage(damage: number, target: TestGameCard): TestGameCard
}

const wrapCard = (game: ServerGame, card: ServerCard, player: ServerPlayerInGame): TestGameCard => {
	const playCardToRow = (row: RowDistanceWrapper, position: number | 'last'): TestGameCardPlayActions => {
		const distance = unwrapRowDistance(row, game, player)
		const rowOwner = card.features.includes(CardFeature.SPY) ? player.opponent : player
		const targetRow = game.board.getRowWithDistanceToFront(rowOwner, distance)
		position = position === 'last' ? targetRow.cards.length : position
		const cardPlayed = game.cardPlay.playCardAsPlayerAction(new ServerOwnedCard(card, player), targetRow.index, position)
		if (!cardPlayed) {
			throw new Error('[Test] Card play declined.')
		}
		game.events.resolveEvents()
		game.events.evaluateSelectors()
		return getCardPlayActions(game, player)
	}
	const takeDamage = (damage: number): TestGameCard => {
		card.dealDamage(DamageInstance.fromUniverse(damage))
		game.events.resolveEvents()
		game.events.evaluateSelectors()
		return cardWrapper
	}
	const takeDamageFromCard = (damage: number, source: TestGameCard | TestGameUnit): TestGameCard => {
		card.dealDamage(DamageInstance.fromCard(damage, source.handle))
		game.events.resolveEvents()
		game.events.evaluateSelectors()
		return cardWrapper
	}
	const dealDamage = (damage: number, target: TestGameCard): TestGameCard => {
		target.handle.dealDamage(DamageInstance.fromCard(damage, card))
		game.events.resolveEvents()
		game.events.evaluateSelectors()
		return cardWrapper
	}
	const findUnit = (): TestGameUnit => {
		const unit = card.unit
		if (!unit) {
			throw new Error('[Test] Card does not have an associated unit.')
		}
		return wrapUnit(game, unit)
	}
	const cardWrapper: TestGameCard = {
		handle: card,
		stats: card.stats,
		buffs: wrapBuffs(game, card),
		location: card.location,
		play: () => playCardToRow('front', 'last'),
		playTo: (row: RowDistanceWrapper, position: number) => playCardToRow(row, position),
		getUnit: findUnit,
		takeDamage: (damage: number) => takeDamage(damage),
		takeDamageFromCard: takeDamageFromCard,
		dealDamage: dealDamage,
	}
	return cardWrapper
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
	countOptions(): number
	targetFirst(): TestGameCardPlayActions
	targetLast(): TestGameCardPlayActions
	targetNth(n: number): TestGameCardPlayActions
}

const getCardPlayActions = (game: ServerGame, player: ServerPlayerInGame): TestGameCardPlayActions => {
	const resolvingCard: TestGameCardPlayActions = {
		countOptions: () => {
			return game.cardPlay.getResolvingCardTargets().length
		},
		targetFirst: () => {
			const validTargets = game.cardPlay.getResolvingCardTargets()
			const chosenTarget = validTargets[0]
			if (!chosenTarget) throw new Error('No valid targets!')
			game.cardPlay.selectCardTarget(player, chosenTarget.target)
			game.events.resolveEvents()
			game.events.evaluateSelectors()
			return resolvingCard
		},
		targetLast: () => {
			const validTargets = game.cardPlay.getResolvingCardTargets()
			const chosenTarget = validTargets[validTargets.length - 1]
			if (!chosenTarget) throw new Error('No valid targets!')
			game.cardPlay.selectCardTarget(player, chosenTarget.target)
			game.events.resolveEvents()
			game.events.evaluateSelectors()
			return resolvingCard
		},
		targetNth: (n: number) => {
			const validTargets = game.cardPlay.getResolvingCardTargets()
			const chosenTarget = validTargets[n]
			if (!chosenTarget) throw new Error('No valid target!')
			game.cardPlay.selectCardTarget(player, chosenTarget.target)
			game.events.resolveEvents()
			game.events.evaluateSelectors()
			return resolvingCard
		},
	}
	return resolvingCard
}

/**
 * Play stack targeting action wrapper
 */
type TestGameCardTarget = {
	select(): TestGameCardPlayActions
}

const wrapCardTarget = (
	game: ServerGame,
	player: ServerPlayerInGame,
	playActions: TestGameCardPlayActions,
	target: PlayTarget | DeployTarget
): TestGameCardTarget => {
	return {
		select: () => {
			game.cardPlay.selectCardTarget(player, target.target)
			game.events.resolveEvents()
			game.events.evaluateSelectors()
			return playActions
		},
	}
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
