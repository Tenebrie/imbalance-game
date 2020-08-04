import Buff from '../Buff'
import CardFeature from '../../enums/CardFeature'
import BuffStackType from '../../enums/BuffStackType'
import CardTribe from '../../enums/CardTribe'
import BuffFeature from '../../enums/BuffFeature'
import BuffAlignment from '../../enums/BuffAlignment'

export default class BuffMessage {
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

	constructor(buff: Buff) {
		this.id = buff.id
		this.cardId = buff.card.id
		this.sourceId = buff.source ? buff.source.id : null
		this.buffClass = buff.buffClass
		this.alignment = buff.alignment
		this.stackType = buff.stackType
		this.cardTribes = buff.cardTribes.slice()
		this.buffFeatures = buff.buffFeatures.slice()
		this.cardFeatures = buff.cardFeatures.slice()

		this.name = buff.name
		this.description = buff.description

		this.duration = buff.duration.toString()
		this.intensity = buff.intensity.toString()
		this.baseDuration = buff.baseDuration.toString()
		this.baseIntensity = buff.baseIntensity.toString()
	}
}
