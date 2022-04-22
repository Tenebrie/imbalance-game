import BuffAlignment from '@shared/enums/BuffAlignment'
import GameEventType from '@shared/enums/GameEventType'
import { getMultipleRandomArrayValues } from '@src/utils/Utils'

import { BuffConstructorParams, ServerRowBuff } from '../../models/buffs/ServerBuff'
import BuffStrength from '../BuffStrength'

export default class BuffGwentRowFroth extends ServerRowBuff {
	public static BOOST = 1
	public static TARGETS = 2

	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
		})

		this.createCallback(GameEventType.TURN_STARTED)
			.require(({ group }) => group.owns(this))
			.perform(() => this.onTurnStarted())
	}

	private onTurnStarted(): void {
		const cards = this.parent.splashableCards
		if (cards.length === 0) {
			return
		}

		const targets = getMultipleRandomArrayValues(cards, BuffGwentRowFroth.TARGETS)
		targets.forEach((target) => {
			this.game.animation.thread(() => {
				target.buffs.addMultiple(BuffStrength, BuffGwentRowFroth.BOOST, this.parent)
			})
		})
	}
}
