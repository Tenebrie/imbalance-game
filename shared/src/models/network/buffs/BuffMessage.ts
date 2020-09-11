import CardFeature from '../../../enums/CardFeature'
import BuffStackType from '../../../enums/BuffStackType'
import CardTribe from '../../../enums/CardTribe'
import BuffFeature from '../../../enums/BuffFeature'
import BuffAlignment from '../../../enums/BuffAlignment'

export default interface BuffMessage {
	id: string
	cardId: string
	sourceId: string | null
	buffClass: string
	alignment: BuffAlignment
	stackType: BuffStackType
	cardTribes: CardTribe[]
	buffFeatures: BuffFeature[]
	cardFeatures: CardFeature[]

	name: string
	description: string

	duration: string
	intensity: string
	baseDuration: string
	baseIntensity: string
}
