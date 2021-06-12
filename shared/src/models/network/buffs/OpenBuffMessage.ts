import Buff from '../../Buff'
import CardFeature from '../../../enums/CardFeature'
import CardTribe from '../../../enums/CardTribe'
import BuffFeature from '../../../enums/BuffFeature'
import BuffAlignment from '../../../enums/BuffAlignment'
import BuffMessage from './BuffMessage'

export default class OpenBuffMessage implements BuffMessage {
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

	constructor(buff: Buff) {
		this.id = buff.id
		this.class = buff.class
		this.alignment = buff.alignment
		this.cardTribes = buff.cardTribes.slice()
		this.buffFeatures = buff.buffFeatures.slice()
		this.cardFeatures = buff.cardFeatures.slice()

		this.name = buff.name
		this.description = buff.description

		this.duration = buff.duration.toString()
		this.baseDuration = buff.baseDuration.toString()

		this.protected = buff.protected
	}
}
