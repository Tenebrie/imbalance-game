import ServerCard from '../game/models/ServerCard'
import AsciiColor from '../enums/AsciiColor'
import ServerUnit from '../game/models/ServerUnit'
import CardLocation from '@shared/enums/CardLocation'
import CardFeature from '@shared/enums/CardFeature'
import ServerPlayer from '../game/players/ServerPlayer'
import express, { Request } from 'express'
import { sortCards } from '@shared/Utils'
import { CardConstructor } from '../game/libraries/CardLibrary'
import { v4 as getRandomId } from 'uuid'
import ServerGame from '@src/game/models/ServerGame'
import ServerBoardRow from '@src/game/models/ServerBoardRow'

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

export const getClassFromConstructor = (constructor: CardConstructor): string => {
	return constructor.name.substr(0, 1).toLowerCase() + constructor.name.substr(1)
}

export const limitValueToInterval = (min: number, value: number, max: number): number => {
	return Math.max(min, Math.min(value, max))
}

export const EmptyFunction = (): void => {
	/* Empty */
}

export default {
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	forEachInNumericEnum(enumeration: any, handler: (val: any) => any): void {
		for (const value in enumeration) {
			if (!isNaN(Number(value))) {
				handler(Number(value))
			}
		}
	},

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	forEachInStringEnum(enumeration: any, handler: (val: any) => any): void {
		for (const value in enumeration) {
			handler(enumeration[value])
		}
	},

	shuffle(inputArray: any[]): any[] {
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
	},

	sortCards(inputArray: ServerCard[]): ServerCard[] {
		return sortCards(inputArray) as ServerCard[]
	},
}
