import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'
import BuffFeature from '@shared/enums/BuffFeature'
import CardFeature from '@shared/enums/CardFeature'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffSappedCard extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEUTRAL,
			features: [BuffFeature.SKIP_ANIMATION, BuffFeature.PROTECTED],
			cardFeatures: [CardFeature.TEMPORARY_CARD],
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => onCardPlayed())
		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(() => onCardPlayed())

		const onCardPlayed = () => {
			this.parent.buffs.removeByReference(this)
		}

		this.createUnitCostOverride().setTo(0)
		this.createSpellCostOverride().setTo(0)
	}
}
