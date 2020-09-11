import Card from './Card'
import Unit from './Unit'
import AnimationType from '../enums/AnimationType'

export default interface Animation {
	type: AnimationType
	sourceCard: Card | null
	sourceUnit: Unit | null
	targetCard: Card | null
	targetCards: Card[] | null
	params: any
}
