import DamageSource from '../enums/DamageSource'
import BoardRow from './BoardRow'
import Card from './Card'

export default interface DamageInstance {
	value: number
	source: DamageSource | undefined
	sourceCard: Card | undefined
	sourceRow: BoardRow | undefined
}
