import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getRandomArrayValue } from '@src/utils/Utils'

export default class GwentSarah extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.RELICT],
			stats: {
				power: 11,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Sarah`,
				description: `*Swap* a card for one of the same color.`,
				flavor: `Little Sarah wants to play!`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_HAND)
			.requireAllied()
			.perform(({ targetCard, player }) => {
				Keywords.returnCardFromHandToDeck(targetCard)
				const validCards = player.cardDeck.allCards.filter((card) => card.color === targetCard.color)
				const cardToSwapFor = getRandomArrayValue(validCards)
				if (!cardToSwapFor) {
					return
				}
				Keywords.drawExactCard(player, cardToSwapFor)
			})
	}
}
