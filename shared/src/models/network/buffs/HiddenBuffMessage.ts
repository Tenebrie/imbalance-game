import Buff from '../../Buff'
import BuffMessage from './BuffMessage'
import BuffAlignment from '../../../enums/BuffAlignment'
import BuffFeature from '../../../enums/BuffFeature'
import CardFeature from '../../../enums/CardFeature'
import CardTribe from '../../../enums/CardTribe'
import BuffStackType from '../../../enums/BuffStackType'

export default class HiddenBuffMessage implements BuffMessage {
	id: string
	cardId: string
	sourceId: string | null

	buffClass = 'hidden'
	alignment: BuffAlignment = BuffAlignment.NEUTRAL
	stackType: BuffStackType = BuffStackType.NONE
	cardTribes: CardTribe[] = []
	buffFeatures: BuffFeature[] = []
	cardFeatures: CardFeature[] = []

	name = 'buff.hidden.name'
	description = ''

	duration = '0'
	intensity = '0'
	baseDuration = '0'
	baseIntensity = '0'

	constructor(buff: Buff) {
		this.id = buff.id
		this.cardId = buff.card.id
		this.sourceId = buff.source ? buff.source.id : null
	}
}
