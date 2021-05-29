import RenderedCard from '@/Pixi/cards/RenderedCard'
import Buff from '@shared/models/Buff'
import Core from '@/Pixi/Core'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import BuffFeature from '@shared/enums/BuffFeature'
import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffMessage from '@shared/models/network/buffs/BuffMessage'

export default class ClientBuff implements Buff {
	id: string
	card: RenderedCard | null
	source: RenderedCard | null
	class: string
	alignment: BuffAlignment
	cardTribes: CardTribe[]
	buffFeatures: BuffFeature[]
	cardFeatures: CardFeature[]

	name: string
	description: string

	duration: number
	baseDuration: number

	protected: boolean

	public constructor(message: BuffMessage) {
		this.id = message.id
		this.card = message.cardId ? Core.game.findRenderedCardById(message.cardId) : null
		this.source = message.sourceId ? Core.game.findRenderedCardById(message.sourceId) : null
		this.class = message.class
		this.alignment = message.alignment
		this.cardTribes = (message.cardTribes || []).slice()
		this.buffFeatures = (message.buffFeatures || []).slice()
		this.cardFeatures = (message.cardFeatures || []).slice()

		this.name = message.name
		this.description = message.description

		this.duration = Number(message.duration)
		this.baseDuration = Number(message.baseDuration)

		this.protected = message.protected
	}
}
