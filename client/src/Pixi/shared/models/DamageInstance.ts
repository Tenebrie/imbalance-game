import CardOnBoard from './CardOnBoard'
import Card from './Card'
import DamageSource from '../enums/DamageSource'

export default interface DamageInstance {
	value: number
	source: DamageSource
	sourceSpell: Card | null
	sourceUnit: CardOnBoard | null
}
