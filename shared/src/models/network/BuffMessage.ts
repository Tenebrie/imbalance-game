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

	duration: number
	intensity: number
	baseDuration: number
	baseIntensity: number

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

		this.duration = buff.duration
		this.intensity = buff.intensity
		this.baseDuration = buff.baseDuration
		this.baseIntensity = buff.baseIntensity
	}
}
