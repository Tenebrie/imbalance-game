import Card from './Card'
import BuffStackType from '../enums/BuffStackType'

export default interface Buff {
	id: string
	card: Card
	source: Card | null
	buffClass: string
	stackType: BuffStackType

	duration: number
	intensity: number
	baseDuration: number
	baseIntensity: number
}
