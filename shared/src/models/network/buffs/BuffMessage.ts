import BuffAlignment from '../../../enums/BuffAlignment'
import BuffFeature from '../../../enums/BuffFeature'
import CardFeature from '../../../enums/CardFeature'
import CardTribe from '../../../enums/CardTribe'
import { BuffLocalization } from '../../cardLocalization/CardLocalization'

export default interface BuffMessage {
	id: string
	class: string
	alignment: BuffAlignment
	cardTribes: CardTribe[]
	buffFeatures: BuffFeature[]
	cardFeatures: CardFeature[]

	localization: BuffLocalization

	duration: string
	baseDuration: string

	protected: boolean
}
