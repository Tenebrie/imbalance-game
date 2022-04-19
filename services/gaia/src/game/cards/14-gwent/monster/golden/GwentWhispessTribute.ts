import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentWhispessTribute extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.MAGE, CardTribe.RELICT],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.addRelatedCards().requireTribe(CardTribe.ORGANIC).requireAnyColor([CardColor.BRONZE, CardColor.SILVER]).requireCollectible()

		this.createLocalization({
			en: {
				name: 'Whispess: Tribute',
				description: 'Play a Bronze or Silver Organic card from your deck.',
				flavor: "I'd be your best - and last.",
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.requireAllied()
			.require(({ targetCard }) => targetCard.color === CardColor.BRONZE || targetCard.color === CardColor.SILVER)
			.require(({ targetCard }) => targetCard.tribes.includes(CardTribe.ORGANIC))
			.perform(({ targetCard }) => {
				Keywords.playCardFromDeckOrGraveyard(targetCard)
			})
	}
}
