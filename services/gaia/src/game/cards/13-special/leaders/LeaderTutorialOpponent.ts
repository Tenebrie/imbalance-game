import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { getLeaderTextVariables } from '@src/utils/Utils'

export default class LeaderTutorialOpponent extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.HUMAN,
			stats: {
				power: 0,
			},
			sortPriority: 0,
			expansionSet: ExpansionSet.TUTORIAL,
		})
		this.dynamicTextVariables = {
			...getLeaderTextVariables(this),
		}
		this.createLocalization({
			en: {
				name: 'AI',
				title: 'The Tutorial Opponent',
				description: "*Leader*<p><i>This is your opponent's leader card.",
			},
		})
	}
}
