import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'

import BotCardEvaluation from '../../../AI/BotCardEvaluation'
import GameHookType from '../../../models/events/GameHookType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class HeroAntoria extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.VALKYRIE],
			stats: {
				power: 25,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.botEvaluation = new CustomBotEvaluation(this)

		this.createHook(GameHookType.CARD_TAKES_DAMAGE, [CardLocation.HAND])
			.require(({ targetCard }) => targetCard.location === CardLocation.BOARD)
			.require(({ targetCard }) => targetCard.ownerGroup === this.ownerGroup)
			.replace((values) => ({
				...values,
				targetCard: this,
			}))
			.perform(() => this.reveal())

		this.createCallback(GameEventType.CARD_DESTROYED, [CardLocation.HAND])
			.require(({ triggeringCard }) => triggeringCard === this)
			.perform(({ formerOwner }) => {
				formerOwner.drawUnitCards(1)
			})
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get expectedValue(): number {
		return this.card.stats.power - 1
	}
}
