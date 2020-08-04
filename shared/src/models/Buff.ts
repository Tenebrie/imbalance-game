import Card from './Card'
import CardTribe from '../enums/CardTribe'
import CardFeature from '../enums/CardFeature'
import BuffStackType from '../enums/BuffStackType'
import BuffFeature from '../enums/BuffFeature'
import BuffAlignment from '../enums/BuffAlignment'

export default interface Buff {
	id: string
	card: Card
	source: Card | null
	buffClass: string
	alignment: BuffAlignment
	stackType: BuffStackType
	cardTribes: CardTribe[]
	buffFeatures: BuffFeature[]
	cardFeatures: CardFeature[]

	name: string
	description: string

	duration: number
	intensity: number
	baseDuration: number
	baseIntensity: number
}
