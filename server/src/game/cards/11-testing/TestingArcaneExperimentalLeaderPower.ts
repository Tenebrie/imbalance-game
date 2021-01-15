import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import CardFeature from '@shared/enums/CardFeature'

export default class TestingArcaneExperimentalLeaderPower extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			features: [CardFeature.HERO_POWER],
			stats: {
				cost: 10,
			},
			expansionSet: ExpansionSet.BASE,
			isExperimental: true,
		})
	}
}
