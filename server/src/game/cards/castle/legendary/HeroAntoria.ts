import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardLocation from '@shared/enums/CardLocation'
import GameHookType, {CardTakesDamageHookArgs, CardTakesDamageHookValues} from '../../../models/GameHookType'
import GameEventType from '@shared/enums/GameEventType'
import {CardDestroyedEventArgs} from '../../../models/GameEventCreators'
import BotCardEvaluation from '../../../AI/BotCardEvaluation'

export default class HeroAntoria extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.CASTLE,
			tribes: [CardTribe.VALKYRIE],
			stats: {
				power: 15,
			}
		})
		this.botEvaluation = new CustomBotEvaluation(this)

		this.createHook<CardTakesDamageHookValues, CardTakesDamageHookArgs>(GameHookType.CARD_TAKES_DAMAGE, [CardLocation.HAND])
			.require(({ targetCard }) => targetCard.location === CardLocation.BOARD)
			.require(({ targetCard }) => targetCard.owner === this.owner)
			.replace(values => ({
				...values,
				targetCard: this
			}))

		this.createCallback<CardDestroyedEventArgs>(GameEventType.CARD_DESTROYED, [CardLocation.HAND])
			.require(({ triggeringCard }) => triggeringCard === this)
			.perform(() => {
				this.owner.drawUnitCards(1)
			})
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get expectedValue(): number {
		return this.card.stats.power - 1
	}
}
