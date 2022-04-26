import BuffAlignment from '@shared/enums/BuffAlignment'
import GameEventType from '@shared/enums/GameEventType'
import { shuffle } from '@shared/Utils'
import GwentWildHuntRider from '@src/game/cards/14-gwent/monster/bronze/GwentWildHuntRider'

import { BuffConstructorParams, ServerRowBuff } from '../../models/buffs/ServerBuff'
import { DamageInstance } from '../../models/ServerDamageSource'

export default class BuffGwentRowFrost extends ServerRowBuff {
	public static readonly DAMAGE = 2

	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.NEGATIVE,
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

		const oppositeRow = this.game.board.getOppositeRow(this.parent)
		const wildHuntRidersCount = oppositeRow.cards.filter((unit) => unit.card instanceof GwentWildHuntRider).length
		const damage = BuffGwentRowFrost.DAMAGE + wildHuntRidersCount * GwentWildHuntRider.EXTRA_DAMAGE

		const lowestPower = cards.sort((a, b) => a.card.stats.power - b.card.stats.power)[0].card.stats.power
		const lowestUnits = cards.filter((unit) => unit.card.stats.power === lowestPower)
		const targetUnit = shuffle(lowestUnits)[0]
		targetUnit.dealDamage(DamageInstance.fromRow(damage, this.parent))
	}
}
