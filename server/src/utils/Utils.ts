import ServerCard from '../game/models/ServerCard'
import AsciiColor from '../enums/AsciiColor'
import ServerUnit from '../game/models/ServerUnit'
import CardLocation from '@shared/enums/CardLocation'
import CardFeature from '@shared/enums/CardFeature'
import ServerPlayer from '../game/players/ServerPlayer'
import express, { Request } from 'express'
import { getMaxCardCopiesForColor, getMaxCardCountForColor } from '@shared/Utils'
import { CardConstructor } from '../game/libraries/CardLibrary'
import { v4 as getRandomId } from 'uuid'
import ServerGame from '@src/game/models/ServerGame'
import ServerBoardRow from '@src/game/models/ServerBoardRow'
import EditorDeck from '@src/../../shared/src/models/EditorDeck'
import EditorCard from '@src/../../shared/src/models/EditorCard'
import DeckUtils from './DeckUtils'
import PopulatedEditorCard from '@src/../../shared/src/models/PopulatedEditorCard'
import CardFaction from '@src/../../shared/src/enums/CardFaction'
import PopulatedEditorDeck from '@src/../../shared/src/models/PopulatedEditorDeck'
import CardColor from '@src/../../shared/src/enums/CardColor'
import { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
import { BuffConstructor } from '@src/game/models/buffs/ServerBuffContainer'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'
import ServerBuff from '@src/game/models/buffs/ServerBuff'
import LeaderStatType from '@shared/enums/LeaderStatType'
import CardTribe from '@shared/enums/CardTribe'

export const createRandomId = (type: 'card' | 'buff', prefix: string): string => {
	return `${type}:${prefix}:${getRandomId()}`
}

export const createRandomGameId = (): string => {
	return `game:${getRandomId()}`
}

export const createRandomPlayerId = (): string => {
	return `player:${getRandomId()}`
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

export const getOwner = (entity: ServerCard | ServerBuff | ServerBoardRow): ServerPlayerInGame | null => {
	if (entity instanceof ServerCard || entity instanceof ServerBoardRow) {
		return entity.owner
	} else {
		return entity.parent.owner
	}
}

export const AnyCardLocation = 'any'

export const restoreObjectIDs = (game: ServerGame, rawJson: string): string => {
	let value = rawJson.replace(/card:redacted:([a-zA-Z0-9-]+)/g, (match, capture) => {
		const card = game.index.findCard(capture)
		if (!card) {
			console.warn(`No card found with id ${capture}`)
			return match
		}
		return card.id
	})
	value = value.replace(/buff:redacted:([a-zA-Z0-9-]+)/g, (match, capture) => {
		const buff = game.index.findBuff(capture)
		if (!buff) {
			console.warn(`No buff found with id ${capture}`)
			return match
		}
		return buff.id
	})
	return value
}

export const getTotalLeaderStat = (player: ServerPlayerInGame | null, type: LeaderStatType): number => {
	if (!player) {
		return 0
	}
	const validCards = player.game.board
		.getUnitsOwnedByPlayer(player)
		.map((unit) => unit.card)
		.concat([player.leader])
		.concat(player.cardHand.allCards.filter((card) => card.features.includes(CardFeature.PASSIVE)))
	return validCards.map((card) => card.stats.getLeaderStat(type)).reduce((acc, val) => acc + val, 0)
}

export type LabyrinthItemSlot = 'weapon' | 'armor' | 'gloves' | 'boots'
export const getLabyrinthItemSlots = (card: ServerCard): LabyrinthItemSlot[] => {
	const cardSlots: LabyrinthItemSlot[] = []
	if (card.tribes.includes(CardTribe.WEAPON)) {
		cardSlots.push('weapon')
	}
	if (card.tribes.includes(CardTribe.ARMOR)) {
		cardSlots.push('armor')
	}
	if (card.tribes.includes(CardTribe.GLOVES)) {
		cardSlots.push('gloves')
	}
	if (card.tribes.includes(CardTribe.BOOTS)) {
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
		const owner = leaderCard.owner
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
		inGame: () => !!leaderCard.owner,
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
	const isHeroPower = card.features.includes(CardFeature.HERO_POWER) || card.features.includes(CardFeature.HERO_ARTIFACT)
	return (
		(location !== CardLocation.HAND && location !== CardLocation.DECK) ||
		(location === CardLocation.HAND && (isHeroPower || card.isRevealed))
	)
}

export const colorize = (text: string | number, color: AsciiColor): string => {
	return `${color}${text}\u001b[0m`
}

export const colorizeId = (text: string): string => {
	return colorize(text, AsciiColor.CYAN)
}

export const colorizeClass = (text: string): string => {
	return colorize(text, AsciiColor.YELLOW)
}

export const colorizePlayer = (text: string): string => {
	return colorize(text, AsciiColor.RED)
}

export const colorizeConsoleText = (text: string): string => {
	return colorize(text, AsciiColor.MAGENTA)
}

export const mapUnitsToCards = (units: ServerUnit[]): ServerCard[] => {
	return units.map((unit) => unit.card)
}

export const mapRelatedCards = (constructors: CardConstructor[]): string[] => {
	return constructors.map((constructor) => getClassFromConstructor(constructor))
}

export const getClassFromConstructor = (constructor: BuffConstructor | CardConstructor | RulesetConstructor): string => {
	return constructor.name.substr(0, 1).toLowerCase() + constructor.name.substr(1)
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
	const invalidCards = deck.cards.filter((card: PopulatedEditorCard) => {
		const cardOfColorCount = deck.cards.filter((filteredCard) => filteredCard.color === card.color).length
		if (cardOfColorCount > getMaxCardCountForColor(card.color)) {
			return true
		}

		if (card.faction !== CardFaction.NEUTRAL && card.faction !== deckFaction) {
			return true
		}

		const maxCount = getMaxCardCopiesForColor(card.color)
		return card.count > maxCount
	})
	return {
		valid: invalidCards.length === 0,
		badCards: invalidCards.map((card) => ({
			count: card.count,
			class: card.class,
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
