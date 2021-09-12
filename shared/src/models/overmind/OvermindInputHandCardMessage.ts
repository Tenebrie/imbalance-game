import { hashCode } from '../../Utils'
import Card from '../Card'

export class OvermindInputHandCardMessage {
	id: string
	cardClass: number
	power: number
	armor: number
	cost: number

	constructor(card: Card) {
		this.id = card.id
		this.cardClass = hashCode(card.class) / 10000000
		this.power = card.stats.power
		this.armor = card.stats.armor
		this.cost = card.stats.unitCost
	}

	public stupify(): [string, number[]] {
		return [this.id, [this.cardClass, this.power, this.armor, this.cost]]
	}
}
