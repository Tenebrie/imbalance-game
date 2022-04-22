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

export default class GwentIrisCompanions extends ServerCard {
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
				name: `Iris' Companions`,
				description: `Move a card from your deck to your hand, then *Discard* a random card.`,
				flavor: `We'd rather keep our names to ourselves. Think of us as… friends of the house.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.requireAllied()
			.perform(({ targetCard, player }) => {
				Keywords.drawExactCard(player, targetCard)
				const cardsInHand = player.cardHand.allCards
				if (cardsInHand.length === 0) {
					return
				}
				const cardToDiscard = getRandomArrayValue(cardsInHand)
				Keywords.discardCard(cardToDiscard)
			})
	}
}
