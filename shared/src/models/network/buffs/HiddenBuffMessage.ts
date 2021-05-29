import Buff from '../../Buff'
import BuffMessage from './BuffMessage'
import BuffAlignment from '../../../enums/BuffAlignment'
import BuffFeature from '../../../enums/BuffFeature'
import CardFeature from '../../../enums/CardFeature'
import CardTribe from '../../../enums/CardTribe'

export default class HiddenBuffMessage implements BuffMessage {
	id: string
	cardId: string | null
	sourceId: string | null

	class = 'hidden'
	alignment: BuffAlignment = BuffAlignment.NEUTRAL
	cardTribes: CardTribe[] = []
	buffFeatures: BuffFeature[] = []
	cardFeatures: CardFeature[] = []

	name = 'buff.hidden.name'
	description = ''

	duration = '0'
	baseDuration = '0'

	protected = true

	constructor(buff: Buff) {
		this.id = buff.id
		this.cardId = buff.card ? buff.card.id : null
		this.sourceId = buff.source ? buff.source.id : null
	}
}
