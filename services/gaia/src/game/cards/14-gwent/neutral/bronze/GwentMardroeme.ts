import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import GwentMardroemeStrengthen from './GwentMardroemeStrengthen'
import GwentMardroemeWeaken from './GwentMardroemeWeaken'

export default class GwentMardroeme extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ALCHEMY, CardTribe.ORGANIC],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentMardroemeStrengthen, GwentMardroemeWeaken],
		})

		this.createLocalization({
			en: {
				name: 'Mardroeme',
				description: '*Spawn* either an *Envigorating Mardroeme* or an *Enfeebling Mardroeme*.',
				flavor: `Eat enough of them, and the world will never be the same…`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => targetCard instanceof GwentMardroemeStrengthen || targetCard instanceof GwentMardroemeWeaken)
			.perform(({ targetCard }) => {
				Keywords.createCard.forOwnerOf(this).fromInstance(targetCard)
			})
	}
}
