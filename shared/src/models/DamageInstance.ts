import Card from './Card'
import BoardRow from './BoardRow'
import DamageSource from '../enums/DamageSource'

export default interface DamageInstance {
	value: number
	source: DamageSource | undefined
	sourceCard: Card | undefined
	sourceRow: BoardRow | undefined
}
