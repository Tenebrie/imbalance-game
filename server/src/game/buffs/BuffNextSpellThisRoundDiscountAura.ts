import ServerBuff, { BuffConstructorParams } from '../models/ServerBuff'
import GameEventType from '@shared/enums/GameEventType'
import CardType from '@shared/enums/CardType'
import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffHiddenSpellDiscount from './BuffHiddenSpellDiscount'

export default class BuffNextSpellThisRoundDiscountAura extends ServerBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
		})

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ triggeringCard }) => triggeringCard.type === CardType.SPELL)
			.require(({ owner }) => owner === this.card.owner)
			.perform(() => {
				this.card.buffs.removeByReference(this)
			})

		this.createCallback(GameEventType.ROUND_ENDED)
			.require(({ player }) => player === this.card.owner)
			.perform(() => {
				this.card.buffs.removeByReference(this)
			})

		this.createSelector()
			.requireTarget(({ target }) => target.type === CardType.SPELL)
			.requireTarget(({ target }) => target.ownerInGame === this.card.ownerInGame)
			.provide(BuffHiddenSpellDiscount)
	}
}
