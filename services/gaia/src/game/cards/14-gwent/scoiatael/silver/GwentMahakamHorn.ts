import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import GwentMahakamHornCreate from './GwentMahakamHornCreate'
import GwentMahakamHornStrength from './GwentMahakamHornStrength'

export default class GwentMahakamHorn extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.ITEM],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.createLocalization({
			en: {
				name: 'Mahakam Horn',
				description: 'Play *Dwarven Call to Arms* or *Dwarven Call to Strength*',
				flavor:
					'Once upon a time, Mahakam held a horn-blowing contest. That day the dwarves made an important discovery: loud noises and snow-capped peaks do not play well together.',
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => targetCard instanceof GwentMahakamHornCreate || targetCard instanceof GwentMahakamHornStrength)
			.perform(({ targetCard }) => {
				Keywords.createCard.forOwnerOf(this).fromInstance(targetCard)
			})
	}
}
