import ServerBuff, { BuffConstructorParams } from '../models/ServerBuff'
import BuffFeature from '@shared/enums/BuffFeature'
import CardFeature from '@shared/enums/CardFeature'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffCreatedCard extends ServerBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEUTRAL,
			features: [BuffFeature.SKIP_ANIMATION],
			cardFeatures: [CardFeature.LOW_SORT_PRIORITY, CardFeature.TEMPORARY_CARD],
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onCardPlayed())
		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(() => this.onCardPlayed())
	}

	private onCardPlayed(): void {
		this.card.buffs.removeByReference(this)
	}

	getUnitCostOverride(): number {
		return 0
	}

	getSpellCostOverride(): number {
		return 0
	}
}
