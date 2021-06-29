import { BuffConstructorParams, ServerRowBuff } from '../models/buffs/ServerBuff'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'
import { shuffle } from '@src/utils/Utils'
import CardTribe from '@shared/enums/CardTribe'
import BuffStrength from '@src/game/buffs/BuffStrength'

export default class BuffRowBloodMoon extends ServerRowBuff {
	public static readonly CARDS_TO_BUFF = 3

	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
		})

		this.createCallback(GameEventType.TURN_ENDED)
			.require(({ group }) => group.owns(this))
			.perform(() => this.onTurnEnded())
	}

	private onTurnEnded(): void {
		const cards = this.parent.cards.filter(
			(unit) =>
				unit.card.tribes.includes(CardTribe.BEAST) ||
				unit.card.tribes.includes(CardTribe.BIRD) ||
				unit.card.tribes.includes(CardTribe.MERFOLK)
		)
		const randomCards = shuffle(cards).slice(0, BuffRowBloodMoon.CARDS_TO_BUFF)
		randomCards.forEach((unit) => {
			this.game.animation.thread(() => {
				unit.card.buffs.add(BuffStrength, this.parent)
			})
		})
		this.game.animation.syncAnimationThreads()
	}
}
