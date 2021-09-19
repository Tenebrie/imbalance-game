import { hashCode } from '../../Utils'
import Card from '../Card'

export class OvermindInputBoardCardMessage {
	cardClass: number
	power: number
	armor: number
	missingPower: number

	constructor(card: Card | null) {
		if (card) {
			this.cardClass = hashCode(card.class) / 10000000
			this.power = card.stats.power
			this.armor = card.stats.armor
			this.missingPower = card.stats.maxPower - card.stats.power
		} else {
			this.cardClass = 0
			this.power = 0
			this.armor = 0
			this.missingPower = 0
		}
	}

	public stupify(): number[] {
		return [this.cardClass, this.power, this.armor, this.missingPower]
	}
}
