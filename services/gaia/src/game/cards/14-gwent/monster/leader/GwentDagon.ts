import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import GwentImpenetrableFog from '../../neutral/bronze/GwentImpenetrableFog'
import GwentTorrentialRain from '../../neutral/bronze/GwentTorrentialRain'

export default class GwentDagon extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.VODYANOY],
			stats: {
				power: 8,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentImpenetrableFog, GwentTorrentialRain],
		})

		this.createLeaderLocalization({
			en: {
				name: 'Dagon',
				description: '*Spawn* *Impenetrable Fog* or *Torrential Rain*.',
				flavor: 'That is not dead which can eternal lie, and with strange aeons even death may die.',
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => targetCard instanceof GwentTorrentialRain || targetCard instanceof GwentImpenetrableFog)
			.perform(({ targetCard }) => {
				Keywords.createCard.for(this.ownerPlayer).fromInstance(targetCard)
			})
	}
}
