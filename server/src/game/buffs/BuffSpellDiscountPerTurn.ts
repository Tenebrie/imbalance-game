import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import {TurnStartedEventArgs} from '../models/events/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import BuffDuration from '@shared/enums/BuffDuration'
import BuffSpellDiscount from './BuffSpellDiscount'
import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'

export default class BuffSpellDiscountPerTurn extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.ADD_INTENSITY)
		this.alignment = BuffAlignment.POSITIVE
		this.buffFeatures = [BuffFeature.SKIP_ANIMATION]

		this.createCallback<TurnStartedEventArgs>(GameEventType.TURN_STARTED)
			.require(({ player }) => player === this.card.owner)
			.perform(() => this.onTurnStart())
	}

	private onTurnStart(): void {
		this.card.buffs.addMultiple(BuffSpellDiscount, this.intensity, this.card, BuffDuration.INFINITY)
	}
}
