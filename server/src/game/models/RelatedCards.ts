import ServerCard from './ServerCard'
import CardTribe from '@shared/enums/CardTribe'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'

export default class RelatedCards {
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
	require(condition: (card: ServerCard) => boolean): RelatedCards {
		this.__conditions.push(condition)
		return this
	}

	requireTribe(tribe: CardTribe): RelatedCards {
		this.__conditions.push((card) => card.tribes.includes(tribe))
		return this
	}

	requireColor(color: CardColor): RelatedCards {
		this.__conditions.push((card) => card.color === color)
		return this
	}

	requireFaction(faction: CardFaction): RelatedCards {
		this.__conditions.push((card) => card.faction === faction)
		return this
	}
}
