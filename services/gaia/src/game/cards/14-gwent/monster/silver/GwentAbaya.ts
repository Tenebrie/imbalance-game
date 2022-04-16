import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import GwentArachasVenom from '../../neutral/bronze/GwentArachasVenom'
import GwentClearSkies from '../../neutral/bronze/GwentClearSkies'
import GwentTorrentialRain from '../../neutral/bronze/GwentTorrentialRain'

export default class GwentAbaya extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.NECROPHAGE],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentTorrentialRain, GwentClearSkies, GwentArachasVenom],
		})

		this.createLocalization({
			en: {
				name: 'Abaya',
				description: '*Spawn* *Torrential Rain*, *Clear Skies* or *Arachas Venom*.',
				flavor: "Seen a lot o' ugly critters in me life – morays, lampreys, blobfish… But never nothin' like this!",
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(
				({ targetCard }) =>
					targetCard instanceof GwentTorrentialRain || targetCard instanceof GwentArachasVenom || targetCard instanceof GwentClearSkies
			)
			.perform(({ targetCard }) => {
				Keywords.createCard.for(this.ownerPlayer).fromInstance(targetCard)
			})
	}
}
