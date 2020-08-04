import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import {CardPlayedEventArgs} from '../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardType from '@shared/enums/CardType'
import BuffFeature from '@shared/enums/BuffFeature'

export default class BuffSpellDiscountSingular extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.ADD_INTENSITY)
		this.buffFeatures = [BuffFeature.SPELL_DISCOUNT_PER_INTENSITY]

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
