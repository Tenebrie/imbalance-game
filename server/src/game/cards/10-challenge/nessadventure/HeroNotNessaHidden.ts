import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import CardFeature from '@src/../../shared/src/enums/CardFeature'

export default class HeroNotNessaHidden extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.QUICK],
			stats: {
				power: 31,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
	}
}
