import ServerBuff, { BuffConstructorParams } from '../models/ServerBuff'
import SpellAnEncouragement from '../cards/01-arcane/leaders/VelElleron/SpellAnEncouragement'
import BuffStrength from './BuffStrength'
import { TurnStartedEventArgs } from '../models/events/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffVelElleronEncouragement extends ServerBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
		})

		this.createCallback<TurnStartedEventArgs>(GameEventType.TURN_STARTED)
			.require(({ player }) => player === this.card.owner)
			.perform(() => this.onTurnStarted())
	}

	private onTurnStarted(): void {
		const bonusPower = SpellAnEncouragement.bonusPower
		this.card.buffs.addMultiple(BuffStrength, bonusPower, this.source)
		this.card.buffs.removeByReference(this)
	}
}
