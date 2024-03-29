import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import LeaderStatType from '@shared/enums/LeaderStatType'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitRoyalArmory extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.BUILDING],
			features: [CardFeature.NIGHTWATCH, CardFeature.APATHY],
			stats: {
				power: 0,
				armor: 12,
				[LeaderStatType.DIRECT_UNIT_DAMAGE]: 3,
				[LeaderStatType.SPLASH_UNIT_DAMAGE]: 1,
			},
			expansionSet: ExpansionSet.BASE,
		})
	}
}
