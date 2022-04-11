import BuffAlignment from '@shared/enums/BuffAlignment'
import CardTribe from '@shared/enums/CardTribe'
import GameEventType from '@shared/enums/GameEventType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import { shuffle } from '@src/utils/Utils'

import { BuffConstructorParams, ServerRowBuff } from '../../models/buffs/ServerBuff'

export default class BuffGwentFullMoon extends ServerRowBuff {
	public static readonly EXTRA_POWER = 2
	public static readonly CARDS_TO_BUFF = 1

	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
		})

		this.createCallback(GameEventType.TURN_STARTED)
			.require(({ group }) => group.owns(this))
			.perform(() => this.onTurnStarted())
	}

	private onTurnStarted(): void {
		const cards = this.parent.cards.filter(
			(unit) => unit.card.tribes.includes(CardTribe.BEAST) || unit.card.tribes.includes(CardTribe.VAMPIRE)
		)
		const randomCards = shuffle(cards).slice(0, BuffGwentFullMoon.CARDS_TO_BUFF)
		randomCards.forEach((unit) => {
			this.game.animation.thread(() => {
				unit.card.buffs.addMultiple(BuffStrength, BuffGwentFullMoon.EXTRA_POWER, this.parent)
			})
		})
		this.game.animation.syncAnimationThreads()
	}
}
