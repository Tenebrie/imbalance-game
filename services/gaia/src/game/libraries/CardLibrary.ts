import { printFactionBreakdown, printLibraryBreakdown } from '@src/utils/LibraryPrinter'
import { colorize, colorizeId, getClassFromConstructor } from '@src/utils/Utils'
import moment from 'moment'

import AsciiColor from '../../enums/AsciiColor'
import ServerCard from '../models/ServerCard'
import ServerGame from '../models/ServerGame'
import CardLibraryPlaceholderGame from '../utils/CardLibraryPlaceholderGame'
import { loadModules } from './ModuleLoader'

export interface CardConstructor extends Function {
	new (game: ServerGame): ServerCard
}

class InternalCardLibrary {
	public cards: ServerCard[] = []

	public loadFromFilesystem() {
		// Do not load files if running tests
		if (process.env.JEST_WORKER_ID !== undefined) {
			return
		}

		console.info(colorize('Loading card definitions...', AsciiColor.YELLOW))

		const { prototypes, upToDateModules } = loadModules<CardConstructor>({
			path: '../cards',
			objectLogName: 'card',
		})

		this.forceLoadCards(prototypes)

		console.info(`Loaded ${colorize(prototypes.length, AsciiColor.CYAN)} card definitions, including:`)
		if (prototypes.length === 0) {
			return
		}

		const filteredCards = this.cards.filter((card) => !card.class.startsWith('testing')).filter((card) => !card.class.startsWith('base'))
		console.info(`- ${colorize(filteredCards.length, AsciiColor.CYAN)} valid definitions`)
		if (prototypes.length - filteredCards.length > 0) {
			console.info(`- ${colorize(prototypes.length - filteredCards.length, AsciiColor.CYAN)} ignored definitions`)
		}

		const oldestTimestamp = upToDateModules.sort((a, b) => a.timestamp - b.timestamp)[0].timestamp
		const newModules = upToDateModules.filter((module) => module.timestamp - oldestTimestamp > 1000)
		if (newModules.length > 0) {
			const sortedNewModules = newModules
				.filter((module) => !module.filename.toLowerCase().startsWith('testing'))
				.sort((a, b) => b.timestamp - a.timestamp)
				.slice(0, 5)
			console.info(
				'Latest updated card definitions: [',
				sortedNewModules
					.map(
						(module) =>
							`\n  [${colorize(moment(new Date(module.timestamp)).format('yyyy.MM.DD | HH:mm:ss'), AsciiColor.BLUE)}]: ${colorizeId(
								module.filename
							)}`
					)
					.join('') + '\n]'
			)
		}

		console.info('Card library breakdown:', printLibraryBreakdown(filteredCards))
		console.info('Gwent faction breakdown:', printFactionBreakdown(filteredCards))
		console.info(colorize('Card library loaded successfully', AsciiColor.GREEN) + '\n')
	}

	public forceLoadCards(cards: CardConstructor[]): void {
		const newCards = cards.filter((card) => !this.cards.some((existingCard) => existingCard.class === getClassFromConstructor(card)))
		this.cards = this.cards.concat(newCards.map((prototype) => new prototype(CardLibraryPlaceholderGame.get())))
	}

	public findPrototypeByClass(cardClass: string): ServerCard {
		const card = this.cards.find((card) => card.class === cardClass)
		if (!card) {
			throw new Error(`Unable to find card ${cardClass}`)
		}
		return card
	}

	public findPrototypeByConstructor(constructor: CardConstructor): ServerCard {
		return this.findPrototypeByClass(getClassFromConstructor(constructor))
	}

	public instantiate(game: ServerGame, constructor: CardConstructor): ServerCard {
		const cardClass = getClassFromConstructor(constructor)
		if (!this.cards.find((card) => card.class === cardClass)) {
			this.forceLoadCards([constructor])
		}
		return this.instantiateFromClass(game, cardClass)
	}

	public instantiateFromInstance(game: ServerGame, card: ServerCard): ServerCard {
		const cardClass = getClassFromConstructor(card.constructor as CardConstructor)
		return this.instantiateFromClass(game, cardClass)
	}

	public instantiateFromClass(game: ServerGame, cardClass: string): ServerCard {
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

class CardLibrary {
	private library: InternalCardLibrary = new InternalCardLibrary()
	private libraryLoaded = false

	public ensureLibraryLoaded(): void {
		if (!this.libraryLoaded) {
			this.libraryLoaded = true
			this.library.loadFromFilesystem()
		}
	}

	public get cards(): ServerCard[] {
		this.ensureLibraryLoaded()
		return this.library.cards.slice()
	}

	public forceLoadCards(cards: CardConstructor[]): void {
		this.library.forceLoadCards(cards)
	}

	public findPrototypeFromClass(cardClass: string): ServerCard {
		this.ensureLibraryLoaded()
		return this.library.findPrototypeByClass(cardClass)
	}

	public findPrototypeFromConstructor(constructor: CardConstructor): ServerCard {
		this.ensureLibraryLoaded()
		return this.library.findPrototypeByConstructor(constructor)
	}

	public instantiate(game: ServerGame, constructor: CardConstructor): ServerCard {
		this.ensureLibraryLoaded()
		return this.library.instantiate(game, constructor)
	}

	public instantiateFromInstance(game: ServerGame, card: ServerCard): ServerCard {
		this.ensureLibraryLoaded()
		return this.library.instantiateFromInstance(game, card)
	}

	public instantiateFromClass(game: ServerGame, cardClass: string): ServerCard {
		this.ensureLibraryLoaded()
		return this.library.instantiateFromClass(game, cardClass)
	}
}

export default new CardLibrary()
