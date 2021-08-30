import BuffAlignment from '../../../enums/BuffAlignment'
import BuffFeature from '../../../enums/BuffFeature'
import CardFeature from '../../../enums/CardFeature'
import CardTribe from '../../../enums/CardTribe'

export default interface BuffMessage {
	id: string
	class: string
	alignment: BuffAlignment
	cardTribes: CardTribe[]
	buffFeatures: BuffFeature[]
	cardFeatures: CardFeature[]

	name: string
	description: string

	duration: string
	baseDuration: string

	protected: boolean
}
