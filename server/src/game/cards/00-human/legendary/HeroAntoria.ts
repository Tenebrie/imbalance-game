import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardLocation from '@shared/enums/CardLocation'
import GameHookType from '../../../models/events/GameHookType'
import GameEventType from '@shared/enums/GameEventType'
import BotCardEvaluation from '../../../AI/BotCardEvaluation'
import ExpansionSet from '@shared/enums/ExpansionSet'

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
			.require(({ targetCard }) => this.ownerGroupInGame.owns(targetCard))
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
