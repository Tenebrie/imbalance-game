import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import GwentWeavessIncantationBoost from './GwentWeavessIncantationBoost'
import GwentWeavessIncantationSummon from './GwentWeavessIncantationSummon'

export default class GwentWeavessIncantation extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.MAGE, CardTribe.RELICT],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentWeavessIncantationBoost, GwentWeavessIncantationSummon],
		})

		this.createLocalization({
			en: {
				name: 'Weavess: Incantation',
				description: '*Spawn* either a *Hexing Incantation* or a *Summoning Incantation*.',
				flavor: 'I sense your pain. I see your fear.',
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(
				({ targetCard }) => targetCard instanceof GwentWeavessIncantationBoost || targetCard instanceof GwentWeavessIncantationSummon
			)
			.perform(({ targetCard }) => {
				Keywords.createCard.forOwnerOf(this).fromInstance(targetCard)
			})
	}
}
