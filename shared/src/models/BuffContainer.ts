import Buff from './Buff'
import Card from './Card'

export default class BuffContainer {
	card: Card
	buffs: Buff[]

	constructor(card: Card) {
		this.card = card
		this.buffs = []
	}
}
