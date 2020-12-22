import ServerBuff, { BuffConstructorParams } from '../models/ServerBuff'
import BuffFeature from '@shared/enums/BuffFeature'
import CardFeature from '@shared/enums/CardFeature'
import { SpellDeployedEventArgs, UnitDeployedEventArgs } from '../models/events/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffSappedCard extends ServerBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEUTRAL,
			features: [BuffFeature.SKIP_ANIMATION],
			cardFeatures: [CardFeature.LOW_SORT_PRIORITY, CardFeature.TEMPORARY_CARD],
		})

		this.createCallback<UnitDeployedEventArgs>(GameEventType.UNIT_DEPLOYED)
			.require(({ triggeringUnit }) => triggeringUnit.card === this.card)
			.perform(() => this.onCardPlayed())

		this.createCallback<SpellDeployedEventArgs>(GameEventType.SPELL_DEPLOYED)
			.require(({ triggeringCard }) => triggeringCard === this.card)
			.perform(() => this.onCardPlayed())
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
