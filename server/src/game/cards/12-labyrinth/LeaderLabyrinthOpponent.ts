import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { getLeaderTextVariables } from '@src/utils/Utils'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class LeaderLabyrinthOpponent extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.NEUTRAL,
			expansionSet: ExpansionSet.LABYRINTH,
		})
		this.dynamicTextVariables = {
			...getLeaderTextVariables(this),
		}
	}
}
