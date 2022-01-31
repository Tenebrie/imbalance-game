import BuffAlignment from '../../../enums/BuffAlignment'
import BuffFeature from '../../../enums/BuffFeature'
import CardFeature from '../../../enums/CardFeature'
import CardTribe from '../../../enums/CardTribe'
import Buff from '../../Buff'
import { BuffLocalization } from '../../cardLocalization/CardLocalization'
import BuffMessage from './BuffMessage'

export default class OpenBuffMessage implements BuffMessage {
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

	constructor(buff: Buff) {
		this.id = buff.id
		this.class = buff.class
		this.alignment = buff.alignment
		this.cardTribes = buff.cardTribes.slice()
		this.buffFeatures = buff.buffFeatures.slice()
		this.cardFeatures = buff.cardFeatures.slice()

		this.localization = buff.localization

		this.duration = buff.duration.toString()
		this.baseDuration = buff.baseDuration.toString()

		this.protected = buff.protected
	}
}
