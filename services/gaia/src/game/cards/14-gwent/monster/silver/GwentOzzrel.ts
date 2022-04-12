import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentOzzrel extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.NECROPHAGE],
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Ozzrel',
				description: '*Consume* a Bronze or Silver unit from either graveyard and boost self by its power.',
				flavor: 'Some necrophages have taken such a liking to human flesh, they no longer are content to merely dig up corpses...',
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_GRAVEYARD)
			.require(({ targetCard }) => targetCard.color === CardColor.SILVER || targetCard.color === CardColor.BRONZE)
			.perform(({ targetCard }) => {
				Keywords.consume.cards({
					targets: [targetCard],
					consumer: this,
				})
			})
	}
}
