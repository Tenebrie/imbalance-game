import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import {CardDrawnEventArgs, CardPlayedEventArgs} from '../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardType from '@shared/enums/CardType'
import ServerCard from '../models/ServerCard'
import ServerAnimation from '../models/ServerAnimation'
import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffNextSpellDiscount from './BuffNextSpellDiscount'

export default class BuffNextSpellDiscountAura extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.ADD_INTENSITY)
		this.alignment = BuffAlignment.POSITIVE

		this.createCallback<CardPlayedEventArgs>(GameEventType.CARD_PLAYED)
			.require(({ triggeringCard }) => triggeringCard.type === CardType.SPELL)
			.require(({ triggeringCard }) => triggeringCard.owner === this.card.owner)
			.perform(() => this.onAlliedSpellPlayed())

		this.createCallback<CardDrawnEventArgs>(GameEventType.CARD_DRAWN)
			.require(({ triggeringCard }) => triggeringCard.owner === this.card.owner)
			.perform(({ triggeringCard }) => this.onNewCardDrawn(triggeringCard))
	}

	private onAlliedSpellPlayed(): void {
		this.card.buffs.removeByReference(this)
	}

	private onNewCardDrawn(card: ServerCard): void {
		card.buffs.addMultiple(BuffNextSpellDiscount, this.intensity, this.source)
		this.game.animation.play(ServerAnimation.cardsReceivedBuff([card], BuffAlignment.POSITIVE))
	}
}
