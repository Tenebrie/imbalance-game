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

export default class GwentSaskia extends ServerCard {
	public static readonly CARD_COUNT = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.AEDIRN, CardTribe.DRACONID],
			stats: {
				power: 11,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		// Originally returned up to two
		this.createLocalization({
			en: {
				name: `Saskia`,
				description: `*Swap* *${GwentSaskia.CARD_COUNT}* cards for Bronze cards.`,
				flavor: `I care not for kings and their titles. In the east lives one who truly deserves a crown.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_HAND)
			.requireAllied()
			.targetCount(GwentSaskia.CARD_COUNT)
			.perform(({ targetCard, player }) => {
				const validCards = player.cardDeck.allCards.filter((card) => card.color === CardColor.BRONZE)
				Keywords.returnCardFromHandToDeck(targetCard)

				if (validCards.length === 0) {
					return
				}

				Keywords.drawExactCard(player, getRandomArrayValue(validCards))
			})
	}
}
