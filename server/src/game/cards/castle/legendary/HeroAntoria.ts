import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardLocation from '@shared/enums/CardLocation'
import GameHookType, {CardTakesDamageHookArgs, CardTakesDamageHookValues} from '../../../models/GameHookType'
import ServerAnimation from '../../../models/ServerAnimation'
import GameEventType from '@shared/enums/GameEventType'
import {CardDestroyedEventArgs} from '../../../models/GameEventCreators'

export default class HeroAntoria extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN, CardFaction.CASTLE)
		this.basePower = 15
		this.baseTribes = [CardTribe.VALKYRIE]

		this.createHook<CardTakesDamageHookValues, CardTakesDamageHookArgs>(GameHookType.CARD_TAKES_DAMAGE)
			.requireLocation(CardLocation.HAND)
			.require(({ targetCard }) => targetCard.location === CardLocation.BOARD)
			.require(({ targetCard }) => targetCard.owner === this.owner)
			.replace(values => ({
				...values,
				targetCard: this
			}))
			.perform(({ targetCard }) => {
				this.game.animation.play(ServerAnimation.cardAttacksCards(targetCard, [this]))
			})

		this.createCallback<CardDestroyedEventArgs>(GameEventType.CARD_DESTROYED)
			.requireLocation(CardLocation.HAND)
			.require(({ triggeringCard }) => triggeringCard === this)
			.perform(() => {
				this.owner.drawUnitCards(1)
			})
	}
}
