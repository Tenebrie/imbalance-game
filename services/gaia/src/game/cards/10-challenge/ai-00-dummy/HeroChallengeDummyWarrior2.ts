import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'

import BotCardEvaluation from '../../../AI/BotCardEvaluation'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class HeroChallengeDummyWarrior2 extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 30,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
		this.botEvaluation = new CustomBotEvaluation(this)
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get expectedValue(): number {
		return 9
	}
}
