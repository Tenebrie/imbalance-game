import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentMaerolorn extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.RELICT],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Maerolorn',
				description: 'Play a Bronze *Deathwish* unit from your deck.',
				flavor: 'Fear not the shadows, but the light.',
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.requireAllied()
			.require(({ targetCard }) => targetCard.color === CardColor.BRONZE)
			.require(({ targetCard }) => targetCard.features.includes(CardFeature.HAS_DEATHWISH))
			.perform(({ targetCard }) => {
				Keywords.playCardFromDeck(targetCard)
			})
	}
}
