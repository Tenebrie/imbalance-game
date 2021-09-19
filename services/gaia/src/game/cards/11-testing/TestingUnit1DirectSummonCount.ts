import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import LeaderStatType from '@shared/enums/LeaderStatType'

import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'

export default class TestingUnit1DirectSummonCount extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 20,
				[LeaderStatType.DIRECT_SUMMON_COUNT]: 1,
			},
			expansionSet: ExpansionSet.TESTING,
		})
	}
}
