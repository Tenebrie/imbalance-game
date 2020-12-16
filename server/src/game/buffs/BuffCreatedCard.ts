import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import BuffFeature from '@shared/enums/BuffFeature'
import CardFeature from '@shared/enums/CardFeature'
import {SpellDeployedEventArgs, UnitDeployedEventArgs} from '../models/events/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'

export default class BuffCreatedCard extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.NONE)
		this.buffFeatures = [BuffFeature.SKIP_ANIMATION]
		this.cardFeatures = [CardFeature.LOW_SORT_PRIORITY, CardFeature.TEMPORARY_CARD]

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

	getUnitCostOverride(baseCost: number): number {
		return 0
	}

	getSpellCostOverride(baseCost: number): number {
		return 0
	}
}
