import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import LeaderStatType from '@shared/enums/LeaderStatType'

export default class UnitAedineShrine extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.BUILDING],
			features: [CardFeature.NIGHTWATCH],
			stats: {
				power: 0,
				armor: 12,
				[LeaderStatType.DIRECT_HEALING_POTENCY]: 3,
				[LeaderStatType.SPLASH_HEALING_POTENCY]: 1,
				[LeaderStatType.RECURRING_HEALING_POTENCY]: 1,
			},
			expansionSet: ExpansionSet.BASE,
		})
	}
}
