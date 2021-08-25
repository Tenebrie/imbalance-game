import Card from './Card'
import Unit from './Unit'
import AnimationType from '../enums/AnimationType'
import BoardRow from './BoardRow'

export default interface Animation {
	type: AnimationType
	sourceCard: Card | null
	sourceUnit: Unit | null
	sourceRow: BoardRow | null
	targetCard: Card | null
	targetCards: Card[] | null
	targetRows: BoardRow[] | null
	params: any
}
