import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import Buff from '@shared/models/Buff'
import { BuffLocalization } from '@shared/models/cardLocalization/CardLocalization'
import BuffMessage from '@shared/models/network/buffs/BuffMessage'

export default class ClientBuff implements Buff {
	id: string
	class: string
	alignment: BuffAlignment
	cardTribes: CardTribe[]
	buffFeatures: BuffFeature[]
	cardFeatures: CardFeature[]

	localization: BuffLocalization

	duration: number
	baseDuration: number

	protected: boolean

	public constructor(message: BuffMessage) {
		this.id = message.id
		this.class = message.class
		this.alignment = message.alignment
		this.cardTribes = (message.cardTribes || []).slice()
		this.buffFeatures = (message.buffFeatures || []).slice()
		this.cardFeatures = (message.cardFeatures || []).slice()

		this.localization = message.localization

		this.duration = Number(message.duration)
		this.baseDuration = Number(message.baseDuration)

		this.protected = message.protected
	}
}
