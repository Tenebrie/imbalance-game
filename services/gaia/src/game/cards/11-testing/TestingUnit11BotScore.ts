import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'

import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'

export default class TestingUnit11BotScore extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 11,
			},
			expansionSet: ExpansionSet.TESTING,
		})

		this.createBotEvaluation().evaluateScore(() => 11)
	}
}
