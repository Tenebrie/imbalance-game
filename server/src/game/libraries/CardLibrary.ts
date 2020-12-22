import path from 'path'
import glob from 'glob'
import * as fs from 'fs'
import ServerCard from '../models/ServerCard'
import ServerGame from '../models/ServerGame'
import CardLibraryPlaceholderGame from '../utils/CardLibraryPlaceholderGame'
import { colorize } from '../../utils/Utils'
import AsciiColor from '../../enums/AsciiColor'
import CardFaction from '@shared/enums/CardFaction'
import CardColor from '@shared/enums/CardColor'
import CardType from '@shared/enums/CardType'

export interface CardConstructor {
	new (game: ServerGame): ServerCard
}

type CardModule = {
	path: string
	filename: string
	timestamp: number
	prototypeFunction: CardConstructor
}

class CardLibrary {
	cards: ServerCard[]

	constructor() {
		if (process.env.JEST_WORKER_ID !== undefined) {
			this.cards = []
			return
		}

		const normalizedPath = path.join(__dirname, '../cards')
		const cardDefinitionFiles = glob.sync(`${normalizedPath}/**/*.js`)

		const cardModules: CardModule[] = cardDefinitionFiles.map((path) => ({
			path: path,
			filename: path.substring(path.lastIndexOf('/') + 1, path.indexOf('.js')),
			timestamp: fs.statSync(path).mtimeMs,
			prototypeFunction: require(path).default,
		}))
		console.info(`Found ${colorize(cardModules.length, AsciiColor.CYAN)} card definition files`)

		const nameMismatchModules = cardModules.filter((module) => module.filename !== module.prototypeFunction.name)
		if (nameMismatchModules.length > 0) {
			const errorArray = nameMismatchModules.map((module) => ({
				file: module.filename,
				prototype: module.prototypeFunction.name,
			}))
			console.warn(
				colorize(`Clearing ${nameMismatchModules.length} card module(s) due to class name mismatch:`, AsciiColor.YELLOW),
				errorArray
			)
			nameMismatchModules.forEach((module) => fs.unlinkSync(module.path))
		}

		const upToDateModules = cardModules
			.filter((module) => module.filename === module.prototypeFunction.name)
			.reduce((acc: CardModule[], obj) => {
				const updatedArray = acc.slice()
				const savedObject = updatedArray.find((savedObject) => savedObject.filename === obj.filename)
				if (!savedObject) {
					updatedArray.push(obj)
				} else if (obj.timestamp > savedObject.timestamp) {
					updatedArray.splice(updatedArray.indexOf(savedObject), 1, obj)
				}
				return updatedArray
			}, [])

		const outdatedModules = cardModules.filter((module) => !upToDateModules.includes(module) && !nameMismatchModules.includes(module))
		if (outdatedModules.length > 0) {
			console.info(colorize(`Clearing ${outdatedModules.length} outdated card module(s)`, AsciiColor.YELLOW))
			outdatedModules.forEach((module) => fs.unlinkSync(module.path))
		}

		const cardPrototypes = upToDateModules.map((module) => module.prototypeFunction)

		this.cards = cardPrototypes.map((prototype) => {
			return new prototype(CardLibraryPlaceholderGame.get())
		})

		console.info(`Loaded ${colorize(cardPrototypes.length, AsciiColor.CYAN)} card definitions.`)
		if (cardPrototypes.length === 0) {
			return
		}

		console.info('Card library breakdown:')
		const nonTestingCards = this.cards.filter((card) => !card.class.startsWith('testing'))
		console.table({
			Human: {
				Leaders: nonTestingCards.filter(
					(card) => card.faction === CardFaction.HUMAN && card.isCollectible && card.color === CardColor.LEADER
				).length,
				Units: nonTestingCards.filter((card) => card.faction === CardFaction.HUMAN && card.isCollectible && card.color !== CardColor.LEADER)
					.length,
				Spells: nonTestingCards.filter(
					(card) =>
						card.faction === CardFaction.HUMAN && !card.isCollectible && card.type === CardType.SPELL && card.color !== CardColor.TOKEN
				).length,
				Tokens: nonTestingCards.filter(
					(card) =>
						card.faction === CardFaction.HUMAN && !card.isCollectible && (card.type !== CardType.SPELL || card.color === CardColor.TOKEN)
				).length,
				Total: nonTestingCards.filter((card) => card.faction === CardFaction.HUMAN).length,
			},
			Arcane: {
				Leaders: nonTestingCards.filter(
					(card) => card.faction === CardFaction.ARCANE && card.isCollectible && card.color === CardColor.LEADER
				).length,
				Units: nonTestingCards.filter(
					(card) => card.faction === CardFaction.ARCANE && card.isCollectible && card.color !== CardColor.LEADER
				).length,
				Spells: nonTestingCards.filter(
					(card) =>
						card.faction === CardFaction.ARCANE && !card.isCollectible && card.type === CardType.SPELL && card.color !== CardColor.TOKEN
				).length,
				Tokens: nonTestingCards.filter(
					(card) =>
						card.faction === CardFaction.ARCANE && !card.isCollectible && (card.type !== CardType.SPELL || card.color === CardColor.TOKEN)
				).length,
				Total: nonTestingCards.filter((card) => card.faction === CardFaction.ARCANE).length,
			},
			Wild: {
				Leaders: nonTestingCards.filter(
					(card) => card.faction === CardFaction.WILD && card.isCollectible && card.color === CardColor.LEADER
				).length,
				Units: nonTestingCards.filter((card) => card.faction === CardFaction.WILD && card.isCollectible && card.color !== CardColor.LEADER)
					.length,
				Spells: nonTestingCards.filter(
					(card) =>
						card.faction === CardFaction.WILD && !card.isCollectible && card.type === CardType.SPELL && card.color !== CardColor.TOKEN
				).length,
				Tokens: nonTestingCards.filter(
					(card) =>
						card.faction === CardFaction.WILD && !card.isCollectible && (card.type !== CardType.SPELL || card.color === CardColor.TOKEN)
				).length,
				Total: nonTestingCards.filter((card) => card.faction === CardFaction.WILD).length,
			},
			Neutral: {
				Leaders: nonTestingCards.filter(
					(card) => card.faction === CardFaction.NEUTRAL && card.isCollectible && card.color === CardColor.LEADER
				).length,
				Units: nonTestingCards.filter(
					(card) => card.faction === CardFaction.NEUTRAL && card.isCollectible && card.color !== CardColor.LEADER
				).length,
				Spells: nonTestingCards.filter(
					(card) =>
						card.faction === CardFaction.NEUTRAL && !card.isCollectible && card.type === CardType.SPELL && card.color !== CardColor.TOKEN
				).length,
				Tokens: nonTestingCards.filter(
					(card) =>
						card.faction === CardFaction.NEUTRAL && !card.isCollectible && (card.type !== CardType.SPELL || card.color === CardColor.TOKEN)
				).length,
				Total: nonTestingCards.filter((card) => card.faction === CardFaction.NEUTRAL).length,
			},
			Testing: {
				Total: this.cards.filter((card) => card.class.startsWith('testing')).length,
			},
		})

		const oldestTimestamp = upToDateModules.sort((a, b) => a.timestamp - b.timestamp)[0].timestamp
		const newModules = upToDateModules.filter((module) => module.timestamp - oldestTimestamp > 1000000)
		if (newModules.length === 0) {
			return
		}
		const sortedNewModules = newModules.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5)
		console.info(
			'Latest updated card definitions:',
			sortedNewModules.map((module) => module.filename)
		)
	}

	public findPrototypeById(id: string): ServerCard | undefined {
		return this.cards.find((card) => card.id === id)
	}

	public findPrototypeByConstructor(constructor: CardConstructor): ServerCard {
		const cardClass = constructor.name.substr(0, 1).toLowerCase() + constructor.name.substr(1)
		const card = this.cards.find((card) => card.class === cardClass)
		if (!card) {
			throw new Error(`Unable to find card ${cardClass}`)
		}
		return card
	}

	public instantiateByInstance(game: ServerGame, card: ServerCard): ServerCard {
		const cardClass = card.constructor.name.substr(0, 1).toLowerCase() + card.constructor.name.substr(1)
		return this.instantiateByClass(game, cardClass)
	}

	public instantiateByConstructor(game: ServerGame, constructor: CardConstructor): ServerCard {
		const cardClass = constructor.name.substr(0, 1).toLowerCase() + constructor.name.substr(1)
		if (!this.cards.find((card) => card.class === cardClass)) {
			this.cards.push(new constructor(CardLibraryPlaceholderGame.get()))
		}
		return this.instantiateByClass(game, cardClass)
	}

	public instantiateByClass(game: ServerGame, cardClass: string): ServerCard {
		const reference = this.cards.find((card) => {
			return card.class === cardClass
		})
		if (!reference) {
			console.error(`No registered card with class '${cardClass}'!`)
			throw new Error(`No registered card with class '${cardClass}'!`)
		}

		const referenceConstructor = reference.constructor as CardConstructor
		return new referenceConstructor(game)
	}
}

export default new CardLibrary()
