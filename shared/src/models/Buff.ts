import Card from './Card'
import BuffStackType from '../enums/BuffStackType'
import CardFeature from '../enums/CardFeature'
import CardTribe from '../enums/CardTribe'

export default interface Buff {
	id: string
	card: Card
	source: Card | null
	buffClass: string
	stackType: BuffStackType
	cardTribes: CardTribe[]
	cardFeatures: CardFeature[]

	duration: number
	intensity: number
	baseDuration: number
	baseIntensity: number
}
