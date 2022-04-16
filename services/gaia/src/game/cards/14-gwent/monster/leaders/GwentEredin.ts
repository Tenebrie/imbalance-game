import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentEredin extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.WILD_HUNT],
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.addRelatedCards().requireTribe(CardTribe.WILD_HUNT).requireColor(CardColor.BRONZE).requireCollectible()

		this.createLeaderLocalization({
			en: {
				name: 'Eredin Bréacc Glas',
				description: '*Spawn* a Bronze Wild Hunt unit.',
				flavor: 'Have some dignity. You know how this will end.',
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => targetCard.isCollectible)
			.require(({ targetCard }) => targetCard.color === CardColor.BRONZE)
			.require(({ targetCard }) => targetCard.tribes.includes(CardTribe.WILD_HUNT))
			.perform(({ targetCard }) => {
				Keywords.createCard.for(this.ownerPlayer).fromInstance(targetCard)
			})
	}
}
