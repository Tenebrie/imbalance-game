import ServerCard from '../models/ServerCard'
import ServerGame from '../models/ServerGame'
import CardLibraryPlaceholderGame from '../utils/CardLibraryPlaceholderGame'
import { colorize, getClassFromConstructor } from '@src/utils/Utils'
import AsciiColor from '../../enums/AsciiColor'
import CardFaction from '@shared/enums/CardFaction'
import CardColor from '@shared/enums/CardColor'
import CardType from '@shared/enums/CardType'
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

		console.info('Card library breakdown:')
		console.table({
			Human: {
				Leaders: filteredCards.filter((card) => card.faction === CardFaction.HUMAN && card.isCollectible && card.color === CardColor.LEADER)
					.length,
				Units: filteredCards.filter((card) => card.faction === CardFaction.HUMAN && card.isCollectible && card.color !== CardColor.LEADER)
					.length,
				Spells: filteredCards.filter(
					(card) =>
						card.faction === CardFaction.HUMAN && !card.isCollectible && card.type === CardType.SPELL && card.color !== CardColor.TOKEN
				).length,
				Tokens: filteredCards.filter(
					(card) =>
						card.faction === CardFaction.HUMAN && !card.isCollectible && (card.type !== CardType.SPELL || card.color === CardColor.TOKEN)
				).length,
				Total: filteredCards.filter((card) => card.faction === CardFaction.HUMAN).length,
			},
			Arcane: {
				Leaders: filteredCards.filter(
					(card) => card.faction === CardFaction.ARCANE && card.isCollectible && card.color === CardColor.LEADER
				).length,
				Units: filteredCards.filter((card) => card.faction === CardFaction.ARCANE && card.isCollectible && card.color !== CardColor.LEADER)
					.length,
				Spells: filteredCards.filter(
					(card) =>
						card.faction === CardFaction.ARCANE && !card.isCollectible && card.type === CardType.SPELL && card.color !== CardColor.TOKEN
				).length,
				Tokens: filteredCards.filter(
					(card) =>
						card.faction === CardFaction.ARCANE && !card.isCollectible && (card.type !== CardType.SPELL || card.color === CardColor.TOKEN)
				).length,
				Total: filteredCards.filter((card) => card.faction === CardFaction.ARCANE).length,
			},
			Wild: {
				Leaders: filteredCards.filter((card) => card.faction === CardFaction.WILD && card.isCollectible && card.color === CardColor.LEADER)
					.length,
				Units: filteredCards.filter((card) => card.faction === CardFaction.WILD && card.isCollectible && card.color !== CardColor.LEADER)
					.length,
				Spells: filteredCards.filter(
					(card) =>
						card.faction === CardFaction.WILD && !card.isCollectible && card.type === CardType.SPELL && card.color !== CardColor.TOKEN
				).length,
				Tokens: filteredCards.filter(
					(card) =>
						card.faction === CardFaction.WILD && !card.isCollectible && (card.type !== CardType.SPELL || card.color === CardColor.TOKEN)
				).length,
				Total: filteredCards.filter((card) => card.faction === CardFaction.WILD).length,
			},
			Neutral: {
				Leaders: filteredCards.filter(
					(card) => card.faction === CardFaction.NEUTRAL && card.isCollectible && card.color === CardColor.LEADER
				).length,
				Units: filteredCards.filter((card) => card.faction === CardFaction.NEUTRAL && card.isCollectible && card.color !== CardColor.LEADER)
					.length,
				Spells: filteredCards.filter(
					(card) =>
						card.faction === CardFaction.NEUTRAL && !card.isCollectible && card.type === CardType.SPELL && card.color !== CardColor.TOKEN
				).length,
				Tokens: filteredCards.filter(
					(card) =>
						card.faction === CardFaction.NEUTRAL && !card.isCollectible && (card.type !== CardType.SPELL || card.color === CardColor.TOKEN)
				).length,
				Total: filteredCards.filter((card) => card.faction === CardFaction.NEUTRAL).length,
			},
		})

		const oldestTimestamp = upToDateModules.sort((a, b) => a.timestamp - b.timestamp)[0].timestamp
		const newModules = upToDateModules.filter((module) => module.timestamp - oldestTimestamp > 1000000)
		if (newModules.length === 0) {
			return
		}
		const sortedNewModules = newModules
			.filter((module) => !module.filename.toLowerCase().startsWith('testing'))
			.sort((a, b) => b.timestamp - a.timestamp)
			.slice(0, 5)
		console.info(
			'Latest updated card definitions:',
			sortedNewModules.map((module) => module.filename)
		)
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
