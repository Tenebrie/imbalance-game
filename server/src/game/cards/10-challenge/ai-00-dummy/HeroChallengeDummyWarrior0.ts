import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import BotCardEvaluation from '../../../AI/BotCardEvaluation'

export default class HeroChallengeDummyWarrior0 extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 15,
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
