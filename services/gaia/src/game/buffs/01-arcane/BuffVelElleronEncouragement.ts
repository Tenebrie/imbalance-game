import BuffAlignment from '@shared/enums/BuffAlignment'
import GameEventType from '@shared/enums/GameEventType'

import SpellAnEncouragement from '../../cards/01-arcane/leaders/VelElleron/SpellAnEncouragement'
import { BuffConstructorParams, ServerCardBuff } from '../../models/buffs/ServerBuff'
import BuffStrength from '../BuffStrength'

class TEST extends ServerCardBuff {}

export default class BuffVelElleronEncouragement extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
		})

		this.createCallback(GameEventType.TURN_STARTED)
			.require(({ group }) => group.owns(this))
			.perform(() => this.onTurnStarted())
	}

	private onTurnStarted(): void {
		const bonusPower = SpellAnEncouragement.bonusPower
		this.parent.buffs.addMultiple(BuffStrength, bonusPower, this.source)
		this.parent.buffs.removeByReference(this)
	}
}
