import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import CardLibrary from '@src/game/libraries/CardLibrary'
import Keywords from '@src/utils/Keywords'
import { getStableRandomValues } from '@src/utils/Utils'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentWhisperingHillock extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.RELICT],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.addRelatedCards().requireTribe(CardTribe.ORGANIC).requireAnyColor([CardColor.BRONZE, CardColor.SILVER]).requireCollectible()

		this.createLeaderLocalization({
			en: {
				name: 'Whispering Hillock',
				description: '*Create* a Bronze or Silver Organic card.',
				flavor: 'That is not dead which can eternal lie, and with strange aeons even death may die.',
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) =>
				getStableRandomValues(
					this,
					CardLibrary.cards
						.filter((card) => card.isCollectible)
						.filter((card) => card.tribes.includes(CardTribe.ORGANIC))
						.filter((card) => card.isBronzeOrSilver)
				).includes(targetCard)
			)
			.perform(({ targetCard }) => {
				Keywords.createCard.for(this.ownerPlayer).fromInstance(targetCard)
			})
	}
}
