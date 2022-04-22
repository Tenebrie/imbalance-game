import Constants from '@shared/Constants'
import AccessLevel from '@shared/enums/AccessLevel'
import AIBehaviour from '@shared/enums/AIBehaviour'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import LeaderStatType from '@shared/enums/LeaderStatType'
import TargetType from '@shared/enums/TargetType'
import { GenericActionMessageType } from '@shared/models/network/messageHandlers/ClientToServerGameMessages'
import RichTextVariables from '@shared/models/RichTextVariables'
import { sortCards } from '@shared/Utils'
import AsciiColor from '@src/enums/AsciiColor'
import ServerBotPlayer from '@src/game/AI/ServerBotPlayer'
import ConnectionEstablishedHandler from '@src/game/handlers/ConnectionEstablishedHandler'
import IncomingMessageHandlers, { onPlayerActionEnd } from '@src/game/handlers/IncomingMessageHandlers'
import { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
import ServerBuff from '@src/game/models/buffs/ServerBuff'
import { BuffConstructor } from '@src/game/models/buffs/ServerBuffContainer'
import ServerBoardRow from '@src/game/models/ServerBoardRow'
import ServerCardStats from '@src/game/models/ServerCardStats'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerEditorDeck from '@src/game/models/ServerEditorDeck'
import ServerGameNovel from '@src/game/models/ServerGameNovel'
import ServerUnit from '@src/game/models/ServerUnit'
import Keywords from '@src/utils/Keywords'
import { AnyCardLocation, colorize, getClassFromConstructor, getTotalLeaderStat, safeWhile } from '@src/utils/Utils'
import { v4 as getRandomId } from 'uuid'
import * as ws from 'ws'

import TestingLeader from '../game/cards/11-testing/TestingLeader'
import { CardConstructor } from '../game/libraries/CardLibrary'
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
	novel: TestGameNovel
	result: TestGameResult
	player: TestGamePlayer
	coopPlayer: TestGamePlayer
	opponent: TestGamePlayer
	allPlayers: TestGamePlayer[][]
	finishCurrentRound(): TestGame
}

export const setupTestGame = (ruleset: RulesetConstructor): TestGame => {
	silenceLogging()
	const game = new ServerGame({ ruleset, playerMoveOrderReversed: false })

	const boardWrapper = setupTestGameBoard(game)
	const stackWrapper = setupCardPlayStack(game)
	const novelWrapper = setupTestGameNovel(game)
	const resultWrapper = setupTestGameResult(game)
	const playerWrappers = setupTestGamePlayers(game)

	game.start()
	game.events.resolveEvents()
	game.events.evaluateSelectors()

	const finishCurrentRound = (): TestGame => {
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
		novel: novelWrapper,
		result: resultWrapper,
		player: playerWrappers[0][0],
		coopPlayer: playerWrappers[0][1],
		opponent: playerWrappers[1][0],
		allPlayers: playerWrappers,
		finishCurrentRound,
	}
	return gameWrapper
}

/**
 * Board wrapper
 */
type TestGameBoard = {
	log(): string
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
		log: (): string => {
			const cards = game.board.rows.map((row) => row.cards.map((unit) => unit.card.class))
			console.debug(cards)
			return cards.toString()
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
	buffs: TestGameBuffContainer
}

const wrapRow = (game: ServerGame, row: ServerBoardRow): TestGameRow => {
	return {
		buffs: wrapBuffContainer(game, row),
	}
}

/**
 * Unit wrapper
 */

type TestGameUnit = {
	handle: ServerCard
	stats: ServerCardStats
	buffs: TestGameBuffContainer
	variables: RichTextVariables
	tribes: CardTribe[]
	getRow(): TestGameRow
	getRowDistance(): RowDistanceWrapper
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
		buffs: wrapBuffContainer(game, unit.card),
		variables: unit.card.variables,
		tribes: unit.card.tribes,
		getRow: () => wrapRow(game, unit.boardRow),
		getRowDistance: () => wrapRowDistance(unit),
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
	getRow(index: RowDistanceWrapper): TestGameRow
	getLeaderStat(stat: LeaderStatType): number
	countOnRow(card: CardConstructor, rowIndex: number): number
	countInHand(card: CardConstructor): number
	endTurn(): void
	endRound(): void
	leaveGame(): void
	tryToEndRound(): void
	deck: {
		add(card: CardConstructor): TestGameCard
	}
	graveyard: {
		add(card: CardConstructor): TestGameCard
	}
}

const setupTestGamePlayers = (game: ServerGame): TestGamePlayer[][] => {
	const deckTemplate = ServerEditorDeck.fromConstructors([TestingLeader])
	game.players.forEach((playerGroup) => {
		safeWhile(
			() => playerGroup.slots.openHumanSlots > 0,
			() => {
				const id = getRandomId()
				const player = new ServerPlayer(`player:id-${id}`, `player-${id}-email`, `player-${id}-username`, AccessLevel.NORMAL, false)
				const slot = playerGroup.slots.grabOpenHumanSlot()
				const usedDeck: ServerEditorDeck = Array.isArray(slot.deck) ? ServerEditorDeck.fromConstructors(slot.deck) : deckTemplate
				const playerInGame = game.addHumanPlayer(player, playerGroup, usedDeck)

				const fakeSocket = ({
					state: 'open',

					close: () => {
						if (fakeSocket.state === 'closed') {
							return
						}

						fakeSocket.state = 'closed'
						playerInGame.disconnect()
						ConnectionEstablishedHandler.onPlayerDisconnected(game, player)
					},
				} as unknown) as ws & { state: 'open' | 'closed' }
				player.registerGameConnection(fakeSocket, game)
			}
		)
		safeWhile(
			() => playerGroup.slots.openBotSlots > 0,
			() => {
				const player = new ServerBotPlayer()
				const slot = playerGroup.slots.grabOpenBotSlot()
				game.addBotPlayer(player, playerGroup, ServerEditorDeck.fromConstructors(slot.deck), AIBehaviour.DEFAULT)
			}
		)
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

	const getRow = (index: RowDistanceWrapper, player: ServerPlayerInGame): TestGameRow => {
		return wrapRow(game, game.board.getRowWithDistanceToFront(player, unwrapRowDistance(index, game, player)))
	}

	const countOnRow = (player: ServerPlayerInGame, card: CardConstructor, distance: number): number => {
		const cards = game.board.getRowWithDistanceToFront(player, distance).cards
		return cards.filter((unit) => unit.card.class === getClassFromConstructor(card)).length
	}

	const countInHand = (player: ServerPlayerInGame, card: CardConstructor): number => {
		return player.cardHand.allCards.filter((cardInHand) => cardInHand.class === getClassFromConstructor(card)).length
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

	const endTurn = (player: ServerPlayerInGame): void => {
		if (player.group.turnEnded) {
			throw new Error('[Test] Turn already ended.')
		}
		player.setUnitMana(0)
		onPlayerActionEnd(game, player)
	}

	const endRound = (player: ServerPlayerInGame): void => {
		const roundIndex = game.roundIndex
		tryToEndRound(player)
		if (!player.group.roundEnded && game.roundIndex === roundIndex) {
			throw new Error('[Test] Unable to end the round.')
		}
	}

	const tryToEndRound = (player: ServerPlayerInGame): void => {
		if (player.group.turnEnded) {
			throw new Error("[Test] This is not this player's turn.")
		}
		if (player.group.roundEnded) {
			throw new Error('[Test] Round already ended.')
		}

		IncomingMessageHandlers[GenericActionMessageType.TURN_END](null, game, player)
	}

	const leaveGame = (playerInGame: ServerPlayerInGame): void => {
		playerInGame.player.disconnectGameSocket()
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
			getRow: (index: RowDistanceWrapper) => getRow(index, player),
			getLeaderStat: (stat: LeaderStatType) => getTotalLeaderStat(player, [stat]),
			countOnRow: (card: CardConstructor, distance: number) => countOnRow(player, card, distance),
			countInHand: (card: CardConstructor) => countInHand(player, card),
			endTurn: () => endTurn(player),
			endRound: () => endRound(player),
			leaveGame: () => leaveGame(player),
			tryToEndRound: () => tryToEndRound(player),
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
	buffs: TestGameBuffContainer
	location: CardLocation
	getUnit(): TestGameUnit
	play(): TestGameCardPlayActions
	playTo(row: 'front' | 'middle' | 'back', position?: number | 'last'): TestGameCardPlayActions
	takeDamage(damage: number): TestGameCard
	takeDamageFromCard(damage: number, source: TestGameCard | TestGameUnit): TestGameCard
	dealDamage(damage: number, target: TestGameCard): TestGameCard
}

const wrapCard = (game: ServerGame, card: ServerCard, player: ServerPlayerInGame): TestGameCard => {
	const playCardToRow = (row: RowDistanceWrapper, position: number | 'last'): TestGameCardPlayActions => {
		if (game.cardPlay.cardResolveStack.currentCard) {
			throw new Error('[Test] Card stack is not empty.')
		}
		if (game.novel.isActive()) {
			throw new Error('[Test] Novel mode is active.')
		}

		const distance = unwrapRowDistance(row, game, player)
		const rowOwner = card.features.includes(CardFeature.SPY) ? player.opponent : player
		const targetRow = game.board.getRowWithDistanceToFront(rowOwner, distance)
		position = position === 'last' ? targetRow.cards.length : position
		const cardPlayed = game.cardPlay.playCardAsPlayerAction(new ServerOwnedCard(card, player), targetRow.index, position)
		if (!cardPlayed) {
			throw new Error('[Test] Card play declined.')
		}
		onPlayerActionEnd(game, player)
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
		buffs: wrapBuffContainer(game, card),
		location: card.location,
		play: () => playCardToRow('front', 'last'),
		playTo: (row: RowDistanceWrapper, position: number | 'last' = 'last') => playCardToRow(row, position),
		getUnit: findUnit,
		takeDamage: (damage: number) => takeDamage(damage),
		takeDamageFromCard: takeDamageFromCard,
		dealDamage: dealDamage,
	}
	return cardWrapper
}

/**
 * Buff wrapper
 */
export type TestGameBuff = {
	handle: ServerBuff
	is(buffConstructor: BuffConstructor): boolean
}

const wrapBuff = (game: ServerGame, buff: ServerBuff): TestGameBuff => {
	return {
		handle: buff,
		is: (buffConstructor) => buff.class === getClassFromConstructor(buffConstructor),
	}
}

/**
 * Card buff wrapper
 */
type TestGameBuffContainer = {
	add(buffConstructor: BuffConstructor): TestGameBuff
	addMultiple(buffConstructor: BuffConstructor, count: number): TestGameBuff[]
	has(buffConstructor: BuffConstructor): boolean
	hasExact(buff: TestGameBuff): boolean
	count(): number
}

const wrapBuffContainer = (game: ServerGame, parent: ServerCard | ServerBoardRow): TestGameBuffContainer => {
	const addBuffs = (buffConstructor: BuffConstructor, count: number): TestGameBuff[] => {
		return parent.buffs.addMultiple(buffConstructor, count, null).map((buff) => wrapBuff(game, buff))
	}

	return {
		add: (buffConstructor) => addBuffs(buffConstructor, 1)[0],
		addMultiple: (buffConstructor, count) => addBuffs(buffConstructor, count),
		has: (buffConstructor) => parent.buffs.has(buffConstructor),
		hasExact: (buff: TestGameBuff) => parent.buffs.hasExact(buff.handle),
		count: () => parent.buffs.buffs.length,
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
	topCard(): ServerOwnedCard
	targetCards(): ServerCard[]
	countOptions(): number
	targetFirst(): TestGameCardPlayActions
	targetLast(): TestGameCardPlayActions
	targetNth(n: number): TestGameCardPlayActions
}

const getCardPlayActions = (game: ServerGame, player: ServerPlayerInGame): TestGameCardPlayActions => {
	const resolvingCard: TestGameCardPlayActions = {
		topCard: () => {
			const entry = game.cardPlay.cardResolveStack.currentCard
			if (!entry) throw new Error('No currently resolving card!')
			return entry
		},
		targetCards: () => {
			const targets = game.cardPlay.getResolvingCardTargets()
			const targetCards = targets
				.map(({ target }) => {
					return (() => {
						switch (target.targetType) {
							case TargetType.BOARD_POSITION:
								return null
							case TargetType.BOARD_ROW:
								return null
							default:
								return target.targetCard
						}
					})()
				})
				.filter((card) => !!card)
				.map((card) => card!)
			return targetCards
		},
		countOptions: () => {
			return game.cardPlay.getResolvingCardTargets().length
		},
		targetFirst: () => {
			const validTargets = game.cardPlay.getResolvingCardTargets()
			const chosenTarget = validTargets[0]
			if (!chosenTarget) throw new Error('No valid targets!')
			game.cardPlay.selectCardTarget(player, chosenTarget.target)
			onPlayerActionEnd(game, player)
			return resolvingCard
		},
		targetLast: () => {
			const validTargets = game.cardPlay.getResolvingCardTargets()
			const chosenTarget = validTargets[validTargets.length - 1]
			if (!chosenTarget) throw new Error('No valid targets!')
			game.cardPlay.selectCardTarget(player, chosenTarget.target)
			onPlayerActionEnd(game, player)
			return resolvingCard
		},
		targetNth: (n: number) => {
			const validTargets = game.cardPlay.getResolvingCardTargets()
			const chosenTarget = validTargets[n]
			if (!chosenTarget) throw new Error('No valid target!')
			game.cardPlay.selectCardTarget(player, chosenTarget.target)
			onPlayerActionEnd(game, player)
			return resolvingCard
		},
	}
	return resolvingCard
}

/**
 * Novel mode wrapper
 */
type TestGameNovel = {
	handle: ServerGameNovel
	clickThroughDialogue(): TestGameNovel
	selectFirstResponse(): TestGameNovel
	selectSecondResponse(): TestGameNovel
	hasQueuedAction(): boolean
	countMoveStatements(): number
	countResponseStatements(): number
}

const setupTestGameNovel = (game: ServerGame): TestGameNovel => {
	const selectNthResponse = (index: number): TestGameNovel => {
		const targetResponse = game.novel.clientResponses[index]
		if (!targetResponse) {
			throw new Error(`No available response statement! Total responses: ${game.novel.clientResponses.length}.`)
		}
		game.novel.executeChapter(targetResponse.chapterId)
		return novelWrapper
	}

	const novelWrapper: TestGameNovel = {
		handle: game.novel,
		clickThroughDialogue: () => {
			const targetMove = game.novel.clientMoves[0]
			if (targetMove) {
				game.novel.executeChapter(targetMove.chapterId)
			} else if (game.novel.hasSayStatementsToPop()) {
				safeWhile(() => game.novel.popClientStateCue())
				game.novel.continueQueue()
			} else if (game.novel.hasQueue() && game.novel.clientResponses.length === 0) {
				game.novel.continueQueue()
			} else {
				throw new Error('No available move statement or queue to continue!')
			}
			return novelWrapper
		},
		selectFirstResponse: () => selectNthResponse(0),
		selectSecondResponse: () => selectNthResponse(1),
		hasQueuedAction: (): boolean => {
			return game.novel.hasQueue() || game.novel.clientMoves.length > 0 || game.novel.clientResponses.length > 0
		},
		countMoveStatements: (): number => {
			return game.novel.clientMoves.length
		},
		countResponseStatements: (): number => {
			return game.novel.clientResponses.length
		},
	}
	return novelWrapper
}

/**
 * Result wrapper
 */
type TestGameResult = {
	isFinished(): boolean
	victoriousGroup(): 'first' | 'second' | 'none'
}

const setupTestGameResult = (game: ServerGame): TestGameResult => {
	return {
		isFinished: () => game.isFinished,
		victoriousGroup: () => {
			const group = game.finalVictoriousGroup
			if (group === game.players[0]) {
				return 'first'
			} else if (group === game.players[1]) {
				return 'second'
			}
			return 'none'
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
	const distance = game.board.getDistanceToFrontLegacy(group, unit.rowIndex)
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

const _warn = (message: string): void => {
	console.debug(`${colorize('[Warning]', AsciiColor.YELLOW)} ${message}`)
}

const silenceLogging = (): void => {
	console.info = jest.fn()
	console.warn = jest.fn()
	console.error = jest.fn()
}
