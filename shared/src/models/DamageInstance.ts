import Card from './Card'
import DamageSource from '../enums/DamageSource'

export default interface DamageInstance {
	value: number
	source: DamageSource
	sourceCard: Card | null
}
