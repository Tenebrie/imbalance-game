import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import {CardPlayedEventArgs} from '../models/events/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardType from '@shared/enums/CardType'
import BuffFeature from '@shared/enums/BuffFeature'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffNextSpellDiscount extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.ADD_INTENSITY)
		this.alignment = BuffAlignment.POSITIVE

		this.createCallback<CardPlayedEventArgs>(GameEventType.CARD_PLAYED)
			.require(({ triggeringCard }) => triggeringCard.type === CardType.SPELL)
			.require(({ triggeringCard }) => triggeringCard.owner === this.card.owner)
			.perform(() => this.onAlliedSpellPlayed())
	}

	getSpellCostOverride(baseCost: number): number {
		return baseCost - this.intensity
	}

	private onAlliedSpellPlayed(): void {
		this.card.buffs.removeByReference(this)
	}
}
