import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import GwentBlackBloodCreate from './GwentBlackBloodCreate'
import GwentBlackBloodDestroy from './GwentBlackBloodDestroy'

export class GwentBlackBlood extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ALCHEMY, CardTribe.ITEM],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentBlackBloodCreate, GwentBlackBloodDestroy],
		})

		this.createLocalization({
			en: {
				name: 'Black Blood',
				description: '*Spawn* either a *Summoning Blood* or a *Destructive Blood*.',
				flavor: `Vampires all agree: use of this potion is bad sportsmanship...`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => targetCard instanceof GwentBlackBloodCreate || targetCard instanceof GwentBlackBloodDestroy)
			.perform(({ targetCard }) => {
				Keywords.createCard.forOwnerOf(this).fromInstance(targetCard)
			})
	}
}
