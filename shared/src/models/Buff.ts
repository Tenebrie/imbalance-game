import Card from './Card'
import CardTribe from '../enums/CardTribe'
import CardFeature from '../enums/CardFeature'
import BuffFeature from '../enums/BuffFeature'
import BuffAlignment from '../enums/BuffAlignment'

export default interface Buff {
	id: string
	card: Card | null
	class: string
	source: Card | null
	alignment: BuffAlignment
	cardTribes: CardTribe[]
	buffFeatures: BuffFeature[]
	cardFeatures: CardFeature[]

	name: string
	description: string

	duration: number
	baseDuration: number

	protected: boolean
}
