import path from 'path'
import glob from 'glob'
import * as fs from 'fs'
import ServerCard from '../models/ServerCard'
import ServerGame from '../models/ServerGame'
import VoidGame from '../utils/VoidGame'
import {colorize} from '../../utils/Utils'
import AsciiColor from '../../enums/AsciiColor'

export interface CardConstructor {
	new (game: ServerGame): ServerCard
}

class CardLibrary {
	cards: ServerCard[]

	constructor() {
		const normalizedPath = path.join(__dirname, '../cards')
		const cardDefinitionFiles = glob.sync(`${normalizedPath}/**/*.js`)
		const cardModules = cardDefinitionFiles.map(path => ({
			path: path,
			filename: path.substring(path.lastIndexOf('/') + 1, path.indexOf('.js')),
			timestamp: fs.statSync(path).mtimeMs,
			prototypeFunction: require(path).default
		}))
		console.info(`Found ${colorize(cardModules.length, AsciiColor.CYAN)} card definition files`)

		const nameMismatchModules = cardModules.filter(module => module.filename !== module.prototypeFunction.name)
		if (nameMismatchModules.length > 0) {
			const errorArray = nameMismatchModules.map(module => ({
				file: module.filename,
				prototype: module.prototypeFunction.name
			}))
			console.warn(colorize(`Clearing ${nameMismatchModules.length} card module(s) due to class name mismatch:`, AsciiColor.YELLOW), errorArray)
			nameMismatchModules.forEach(module => fs.unlinkSync(module.path))
		}

		const filteredModules = cardModules
			.filter(module => module.filename === module.prototypeFunction.name)
			.reduce((acc, obj) => {
				const updatedArray = acc.slice()
				const savedObject = updatedArray.find(savedObject => savedObject.filename === obj.filename)
				if (!savedObject) {
					updatedArray.push(obj)
				} else if (obj.timestamp > savedObject.timestamp) {
					updatedArray.splice(updatedArray.indexOf(savedObject), 1, obj)
				}
				return updatedArray
			}, [])

		const outdatedModules = cardModules.filter(module => !filteredModules.includes(module) && !nameMismatchModules.includes(module))
		if (outdatedModules.length > 0) {
			console.info(colorize(`Clearing ${outdatedModules.length} outdated card module(s)`, AsciiColor.YELLOW))
			outdatedModules.forEach(module => fs.unlinkSync(module.path))
		}

		const cardPrototypes = filteredModules.map(module => module.prototypeFunction)

		this.cards = cardPrototypes.map(prototype => {
			return new prototype(VoidGame.get())
		})

		const sortedModules = filteredModules.sort((a, b) => b.timestamp - a.timestamp)
		const latestClasses = sortedModules.slice(0, 5).map(card => card.prototypeFunction.name)
		console.info(`Loaded ${colorize(cardPrototypes.length, AsciiColor.CYAN)} card definitions. Newest 5:`, latestClasses)
	}

	public findPrototypeById(id: string): ServerCard | null {
		return this.cards.find(card => card.id === id)
	}

	public instantiateByInstance(game: ServerGame, card: ServerCard): ServerCard {
		const cardClass = card.constructor.name.substr(0, 1).toLowerCase() + card.constructor.name.substr(1)
		return this.instantiateByClass(game, cardClass)
	}

	public instantiateByConstructor(game: ServerGame, constructor: CardConstructor): ServerCard {
		const cardClass = constructor.name.substr(0, 1).toLowerCase() + constructor.name.substr(1)
		return this.instantiateByClass(game, cardClass)
	}

	public instantiateByClass(game: ServerGame, cardClass: string): ServerCard {
		const reference = this.cards.find(card => {
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
