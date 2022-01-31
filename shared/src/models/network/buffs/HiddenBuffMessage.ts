import BuffAlignment from '../../../enums/BuffAlignment'
import BuffFeature from '../../../enums/BuffFeature'
import CardFeature from '../../../enums/CardFeature'
import CardTribe from '../../../enums/CardTribe'
import Buff from '../../Buff'
import { BuffLocalization, BuffLocalizationEntry } from '../../cardLocalization/CardLocalization'
import BuffMessage from './BuffMessage'

const defaultLocalization: BuffLocalizationEntry = {
	name: '',
	description: '',
}

export default class HiddenBuffMessage implements BuffMessage {
	id: string

	class = 'hidden'
	alignment: BuffAlignment = BuffAlignment.NEUTRAL
	cardTribes: CardTribe[] = []
	buffFeatures: BuffFeature[] = []
	cardFeatures: CardFeature[] = []

	localization: BuffLocalization

	duration = '0'
	baseDuration = '0'

	protected = true

	constructor(buff: Buff) {
		this.id = buff.id

		this.localization = {
			en: defaultLocalization,
			ru: defaultLocalization,
		}
	}
}
