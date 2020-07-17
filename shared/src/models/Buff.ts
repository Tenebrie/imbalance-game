import Card from './Card'
import CardTribe from '../enums/CardTribe'
import CardFeature from '../enums/CardFeature'
import BuffStackType from '../enums/BuffStackType'
import BuffFeature from '../enums/BuffFeature'

export default interface Buff {
	id: string
	card: Card
	source: Card | null
	buffClass: string
	stackType: BuffStackType
	cardTribes: CardTribe[]
	buffFeatures: BuffFeature[]
	cardFeatures: CardFeature[]

	duration: number
	intensity: number
	baseDuration: number
	baseIntensity: number
}
