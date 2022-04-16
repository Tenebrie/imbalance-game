import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import { getClassFromConstructor } from '@src/utils/Utils'

import { CardConstructor } from '../libraries/CardLibrary'
import ServerCard from './ServerCard'

export default class RelatedCardsDefinition {
	private readonly __conditions: ((card: ServerCard) => boolean)[]

	constructor() {
		this.__conditions = []
	}

	public get conditions(): ((card: ServerCard) => boolean)[] {
		return this.__conditions
	}

	/* Require a condition to be true
	 * ------------------------------------------------------------------------
	 * Add a new condition to the require chain.
	 *
	 * The card will only be valid if all conditions are satisfied
	 */
	require(condition: (card: ServerCard) => boolean): RelatedCardsDefinition {
		this.__conditions.push(condition)
		return this
	}

	requireCollectible(): RelatedCardsDefinition {
		this.__conditions.push((card) => card.isCollectible)
		return this
	}

	requireExact(target: CardConstructor): RelatedCardsDefinition {
		this.__conditions.push((card) => card.class === getClassFromConstructor(target))
		return this
	}

	requireFeature(feature: CardFeature): RelatedCardsDefinition {
		this.__conditions.push((card) => card.features.includes(feature))
		return this
	}

	requireTribe(tribe: CardTribe): RelatedCardsDefinition {
		this.__conditions.push((card) => card.tribes.includes(tribe))
		return this
	}

	requireAnyTribe(tribes: CardTribe[]): RelatedCardsDefinition {
		this.__conditions.push((card) => card.tribes.some((tribe) => tribes.includes(tribe)))
		return this
	}

	requireColor(color: CardColor): RelatedCardsDefinition {
		this.__conditions.push((card) => card.color === color)
		return this
	}

	requireAnyColor(colors: CardColor[]): RelatedCardsDefinition {
		this.__conditions.push((card) => colors.includes(card.color))
		return this
	}

	requireFaction(faction: CardFaction): RelatedCardsDefinition {
		this.__conditions.push((card) => card.faction === faction)
		return this
	}
}
