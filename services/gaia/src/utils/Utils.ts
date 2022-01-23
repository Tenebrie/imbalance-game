import Constants from '@shared/Constants'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import LeaderStatType from '@shared/enums/LeaderStatType'
import EditorCard from '@shared/models/EditorCard'
import EditorDeck from '@shared/models/EditorDeck'
import PopulatedEditorCard from '@shared/models/PopulatedEditorCard'
import PopulatedEditorDeck from '@shared/models/PopulatedEditorDeck'
import { getMaxCardCopiesForColor, getMaxCardCountForColor } from '@shared/Utils'
import { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
import ServerBuff from '@src/game/models/buffs/ServerBuff'
import { BuffConstructor } from '@src/game/models/buffs/ServerBuffContainer'
import ServerBoardRow from '@src/game/models/ServerBoardRow'
import ServerGame from '@src/game/models/ServerGame'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'
import express, { Request } from 'express'
import { v4 as getRandomId } from 'uuid'

import AsciiColor from '../enums/AsciiColor'
import { CardConstructor } from '../game/libraries/CardLibrary'
import ServerCard from '../game/models/ServerCard'
import ServerUnit from '../game/models/ServerUnit'
import ServerPlayer from '../game/players/ServerPlayer'
import DeckUtils from './DeckUtils'

export const safeWhile = (
	condition: () => boolean | null | undefined,
	callback: (breakWhile: () => void) => void = () => {
		/* Empty */
	}
): void => {
	let iterations = 0
	let shouldBreak = false
	while (condition()) {
		callback(() => {
			shouldBreak = true
		})
		if (shouldBreak) {
			break
		}
		iterations += 1
		if (iterations >= 1000) {
			throw new Error('Too many while iterations')
		}
	}
}

export const createRandomGuid = (): string => {
	return getRandomId()
}

export const createRandomId = (type: 'card' | 'buff', prefix: string): string => {
	return `${type}:${prefix}:${getRandomId()}`
}

export const createRandomGameId = (): string => {
	return `game:${getRandomId()}`
}

export const createHumanPlayerId = (): string => {
	return `player:${getRandomId()}`
}

export const createHumanGroupId = (): string => {
	return `group:${getRandomId()}`
}

export const createBotPlayerId = (): string => {
	return `ai:${getRandomId()}`
}

export const createRandomEditorDeckId = (): string => {
	return `deck:${getRandomId()}`
}

export const toRowIndex = (rowOrIndex: number | ServerBoardRow): number => {
	return typeof rowOrIndex === 'number' ? rowOrIndex : rowOrIndex.index
}

export const getOwnerPlayer = (entity: ServerCard | ServerBuff | ServerUnit | ServerBoardRow): ServerPlayerInGame | null => {
	const parent = entity instanceof ServerBuff ? entity.parent : entity
	if (parent instanceof ServerUnit) {
		return parent.originalOwner
	} else if (parent instanceof ServerBoardRow) {
		return null
	}
	const ownerPlayer = parent.ownerPlayerNullable
	if (ownerPlayer) {
		return ownerPlayer
	}

	const unit = parent.unit
	if (!unit) {
		return null
	}
	return unit.originalOwner
}

export const getOwnerGroup = (entity: ServerCard | ServerUnit | ServerBuff | ServerBoardRow): ServerPlayerGroup | null => {
	const parent = entity instanceof ServerBuff ? entity.parent : entity

	if (parent instanceof ServerCard) {
		return parent.ownerGroupNullable
	} else {
		return parent.owner
	}
}

export const AnyCardLocation = 'any'

export const restoreObjectIDs = (game: ServerGame, rawJson: string): string => {
	let value = rawJson.replace(/card::([a-zA-Z0-9-]+)/g, (match, capture) => {
		const card = game.index.findCard(capture)
		if (!card) {
			console.warn(`No card found with id ${capture}`)
			return match
		}
		return card.id
	})
	value = value.replace(/buff::([a-zA-Z0-9-]+)/g, (match, capture) => {
		const buff = game.index.findBuff(capture)
		if (!buff) {
			console.warn(`No buff found with id ${capture}`)
			return match
		}
		return buff.id
	})
	return value
}

export const getTotalLeaderStat = (player: ServerPlayerInGame | ServerPlayerGroup | null, types: LeaderStatType[]): number => {
	if (!player) {
		return 0
	}

	const playerGroup = player instanceof ServerPlayerGroup ? player : player.group
	const validCards = player.game.board.getUnitsOwnedByGroup(playerGroup).map((unit) => unit.card)

	if (player instanceof ServerPlayerInGame) {
		validCards.push(player.leader)
		const extraCards = player.cardHand.allCards.filter((card) => card.features.includes(CardFeature.PASSIVE))
		extraCards.forEach((card) => validCards.push(card))
	}
	return validCards.map((card) => card.stats.getLeaderStats(types)).reduce((acc, val) => acc + val, 0)
}

export type LabyrinthItemSlot = 'weapon' | 'armor' | 'gloves' | 'boots'
export const getLabyrinthItemSlots = (card: ServerCard): LabyrinthItemSlot[] => {
	const cardSlots: LabyrinthItemSlot[] = []
	if (card.tribes.includes(CardTribe.RITES_WEAPON)) {
		cardSlots.push('weapon')
	}
	if (card.tribes.includes(CardTribe.RITES_ARMOR)) {
		cardSlots.push('armor')
	}
	if (card.tribes.includes(CardTribe.RITES_GLOVES)) {
		cardSlots.push('gloves')
	}
	if (card.tribes.includes(CardTribe.RITES_BOOTS)) {
		cardSlots.push('boots')
	}
	return cardSlots
}

interface TryUntilArgs {
	try: () => void | Promise<void>
	until: () => boolean | Promise<boolean>
	maxAttempts: number
}

export const tryUntil = (args: TryUntilArgs): boolean => {
	for (let i = 0; i < args.maxAttempts; i++) {
		args.try()
		if (args.until()) {
			return true
		}
	}
	return false
}

interface LeaderTextVariables {
	inGame: () => boolean
	playerName: () => string
}

export const getLeaderTextVariables = (leaderCard: ServerCard): LeaderTextVariables => {
	const getPlayerName = () => {
		const owner = leaderCard.ownerPlayerNullable
		if (!owner) {
			return ''
		}
		const name = owner.player.username
		if (name.indexOf('#') === -1) {
			return name
		}
		return name.slice(0, name.indexOf('#'))
	}

	return {
		inGame: () => !!leaderCard.ownerPlayerNullable,
		playerName: () => getPlayerName(),
	}
}

export const setCookie = (res: express.Response, name: string, value: string): void => {
	res.cookie(name, value, { maxAge: 6 * 30 * 24 * 3600 * 1000, httpOnly: true, sameSite: true })
}

export const clearCookie = (res: express.Response, name: string, value: string): void => {
	res.cookie(name, value, { maxAge: Date.now(), httpOnly: true, sameSite: true })
}

export const getPlayerFromAuthenticatedRequest = (req: Request): ServerPlayer => {
	// @ts-ignore
	return (req['player'] as unknown) as ServerPlayer
}

export const invalidEmailCharacters = /[^a-zA-Zа-яА-Я0-9\-_.@+]/g
export const invalidUsernameCharacters = /[^a-zA-Zа-яА-Я0-9\-_.]/g

export const registerFormValidators = {
	email: (email: string): boolean => {
		return email.length > 0 && email.length <= 128 && !invalidEmailCharacters.exec(email)
	},
	username: (username: string): boolean => {
		return username.length > 0 && username.length <= 16 && !invalidUsernameCharacters.exec(username)
	},
	password: (password: string): boolean => {
		return password.length > 0 && password.length <= 128
	},
}

const shortIdCharset = 'abcdefghkmnopqrstuvwxyzABCDEFGHKMNPQRSTUVWXYZ0123456789'
export const generateShortId = (length: number): string => {
	let id = ''
	for (let i = 0; i < length; i++) {
		const charIndex = Math.floor(Math.random() * shortIdCharset.length)
		id += shortIdCharset.charAt(charIndex)
	}
	return id
}

export const isCardPublic = (card: ServerCard): boolean => {
	const location = card.location
	const isProminent =
		card.features.includes(CardFeature.PROMINENT) ||
		card.features.includes(CardFeature.HERO_POWER) ||
		card.features.includes(CardFeature.HERO_ARTIFACT)
	return (
		(location !== CardLocation.HAND && location !== CardLocation.DECK) ||
		(location === CardLocation.HAND && (isProminent || card.isRevealed))
	)
}

export const colorize = (text: string | number, color: AsciiColor): string => {
	return `${color}${text}\u001b[0m`
}

export const colorizeId = (text: string | number): string => {
	return colorize(text, AsciiColor.CYAN)
}

export const colorizeClass = (text: string | number): string => {
	return colorize(text, AsciiColor.YELLOW)
}

export const colorizePlayer = (text: string | number): string => {
	return colorize(text, AsciiColor.RED)
}

export const colorizeConsoleText = (text: string | number): string => {
	return colorize(text, AsciiColor.MAGENTA)
}

export const mapUnitsToCards = (units: ServerUnit[]): ServerCard[] => {
	return units.map((unit) => unit.card)
}

export const getClassFromConstructor = (constructor: BuffConstructor | CardConstructor | RulesetConstructor): string => {
	return constructor.name.substr(0, 1).toLowerCase() + constructor.name.substr(1)
}

export const getConstructorFromCard = (card: ServerCard): CardConstructor => {
	return card.constructor as CardConstructor
}

export const limitValueToInterval = (min: number, value: number, max: number): number => {
	return Math.max(min, Math.min(value, max))
}

export const EmptyFunction = (): void => {
	/* Empty */
}

export const getDeckLeader = (deck: PopulatedEditorDeck): PopulatedEditorCard | null => {
	return deck.cards.find((card) => card.color === CardColor.LEADER) || null
}

export const getDeckFaction = (deck: PopulatedEditorDeck): CardFaction => {
	const leader = getDeckLeader(deck)
	if (leader && leader.faction !== CardFaction.NEUTRAL) {
		return leader.faction
	}
	const factionCard = deck.cards.find((card) => card.faction !== CardFaction.NEUTRAL)
	if (factionCard) {
		return factionCard.faction
	}
	return CardFaction.NEUTRAL
}

export const validateEditorDeck = (unpopulatedDeck: EditorDeck): { valid: boolean; badCards: EditorCard[] } => {
	const deck = DeckUtils.populateDeck(unpopulatedDeck)
	const deckFaction = getDeckFaction(deck)

	const getCardInvalidReason = (card: PopulatedEditorCard): string | null => {
		const cardOfColorCount = deck.cards.filter((filteredCard) => filteredCard.color === card.color).length
		if (cardOfColorCount > getMaxCardCountForColor(card.color)) {
			return 'tooManyCardsOfColor'
		}

		if (card.faction !== CardFaction.NEUTRAL && card.faction !== deckFaction) {
			return 'factionMismatch'
		}

		const maxCount = getMaxCardCopiesForColor(card.color)
		if (card.count > maxCount) {
			return 'tooManyCardCopies'
		}
		return null
	}

	const invalidCards = deck.cards
		.map((card) => ({
			card,
			reason: getCardInvalidReason(card),
		}))
		.filter((wrapper) => wrapper.reason !== null)
	return {
		valid: invalidCards.length === 0,
		badCards: invalidCards.map((wrapper) => ({
			count: wrapper.card.count,
			class: wrapper.card.class,
			reason: wrapper.reason,
		})),
	}
}

export const snakeToCamelCase = (str: string): string =>
	str.toLowerCase().replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''))

export function shuffle<T>(inputArray: T[]): T[] {
	const array = inputArray.slice()
	let currentIndex = array.length

	while (currentIndex > 0) {
		const randomIndex = Math.floor(Math.random() * currentIndex)
		currentIndex -= 1
		const temporaryValue = array[currentIndex]
		array[currentIndex] = array[randomIndex]
		array[randomIndex] = temporaryValue
	}

	return array
}

export const getRandomArrayValue = <T>(array: T[]): T => {
	return array[Math.floor(Math.random() * array.length)]
}

export const forEachRowCardSlot = (callback: (index: number) => void): void => {
	for (let i = 0; i < Constants.MAX_CARDS_PER_ROW; i++) {
		callback(i)
	}
}

export const collapseNumber = (valueOrGetter: number | (() => number)): number => {
	return typeof valueOrGetter === 'function' ? valueOrGetter() : valueOrGetter
}
