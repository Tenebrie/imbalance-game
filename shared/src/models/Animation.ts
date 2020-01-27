import AnimationType from '../enums/AnimationType'
import CardOnBoard from './CardOnBoard'
import Card from './Card'

export default class Animation {
	type: AnimationType
	targetCard: Card | null
	sourceUnit: CardOnBoard | null
	targetUnit: CardOnBoard | null

	constructor(type: AnimationType) {
		this.type = type
	}
}
