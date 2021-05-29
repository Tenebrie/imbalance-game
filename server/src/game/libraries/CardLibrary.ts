import ServerCard from '../models/ServerCard'
import ServerGame from '../models/ServerGame'
import CardLibraryPlaceholderGame from '../utils/CardLibraryPlaceholderGame'
import { colorize } from '@src/utils/Utils'
import AsciiColor from '../../enums/AsciiColor'
import CardFaction from '@shared/enums/CardFaction'
import CardColor from '@shared/enums/CardColor'
import CardType from '@shared/enums/CardType'
import { loadModules } from './ModuleLoader'

export interface CardConstructor extends Function {
	new (game: ServerGame): ServerCard
}

class CardLibrary {
	public cards: ServerCard[] = []

	constructor() {
		// Do not load files if running tests
		if (process.env.JEST_WORKER_ID !== undefined) {
			return
		}

		const { prototypes, upToDateModules } = loadModules<CardConstructor>({
			path: '../cards',
			objectLogName: 'card',
		})

		this.forceLoadCards(prototypes)

		console.info(`Loaded ${colorize(prototypes.length, AsciiColor.CYAN)} card definitions`)
		if (prototypes.length === 0) {
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
		const newCards = cards.filter((card) => !this.cards.some((existingCard) => existingCard.class === this.getClassFromConstructor(card)))
		this.cards = this.cards.concat(newCards.map((prototype) => new prototype(CardLibraryPlaceholderGame.get())))
	}

	public getClassFromConstructor(constructor: CardConstructor): string {
		return constructor.name.substr(0, 1).toLowerCase() + constructor.name.substr(1)
	}

	public findPrototypeByConstructor(constructor: CardConstructor): ServerCard {
		const cardClass = this.getClassFromConstructor(constructor)
		const card = this.cards.find((card) => card.class === cardClass)
		if (!card) {
			throw new Error(`Unable to find card ${cardClass}`)
		}
		return card
	}

	public instantiateByInstance(game: ServerGame, card: ServerCard): ServerCard {
		const cardClass = this.getClassFromConstructor(card.constructor as CardConstructor)
		return this.instantiateByClass(game, cardClass)
	}

	public instantiateByConstructor(game: ServerGame, constructor: CardConstructor): ServerCard {
		const cardClass = this.getClassFromConstructor(constructor)
		if (!this.cards.find((card) => card.class === cardClass)) {
			this.forceLoadCards([constructor])
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
