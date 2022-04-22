import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import GwentAlzursThunder from '../../neutral/bronze/GwentAlzursThunder'
import GwentClearSkies from '../../neutral/bronze/GwentClearSkies'
import GwentImpenetrableFog from '../../neutral/bronze/GwentImpenetrableFog'

export default class GwentIdaEmeanaepSivney extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.MAGE, CardTribe.ELF],
			stats: {
				power: 4,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Ida Emean aep Sivney`,
				description: `*Spawn* *Impenetrable Fog*, *Clear Skies* or *Alzur's Thunder*.`,
				flavor: `I am a Sage. My power lies in possessing knowledge. Not sharing it.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(
				({ targetCard }) =>
					targetCard instanceof GwentImpenetrableFog || targetCard instanceof GwentClearSkies || targetCard instanceof GwentAlzursThunder
			)
			.perform(({ targetCard }) => {
				Keywords.createCard.for(this.ownerPlayer).fromInstance(targetCard)
			})
	}
}
