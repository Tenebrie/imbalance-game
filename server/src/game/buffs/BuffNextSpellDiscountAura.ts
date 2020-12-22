import ServerBuff, { BuffConstructorParams } from '../models/ServerBuff'
import { CardPlayedEventArgs } from '../models/events/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardType from '@shared/enums/CardType'
import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffHiddenSpellDiscount from './BuffHiddenSpellDiscount'

export default class BuffNextSpellDiscountAura extends ServerBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
		})

		this.createCallback<CardPlayedEventArgs>(GameEventType.SPELL_DEPLOYED)
			.require(({ triggeringCard }) => triggeringCard.owner === this.card.owner)
			.perform(() => this.card.buffs.removeByReference(this))

		this.createSelector()
			.requireTarget(({ target }) => target.type === CardType.SPELL)
			.requireTarget(({ target }) => target.ownerInGame === this.card.ownerInGame)
			.provide(BuffHiddenSpellDiscount)
		//.onSelected(({ target }) => target.buffs.add(BuffHiddenSpellDiscount, this.card))
		//.onReleased(({ target }) => target.buffs.remove(BuffHiddenSpellDiscount, 1))
	}
}
