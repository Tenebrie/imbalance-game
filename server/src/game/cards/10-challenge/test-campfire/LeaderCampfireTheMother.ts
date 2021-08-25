import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import { getLeaderTextVariables } from '@src/utils/Utils'

export default class LeaderCampfireTheMother extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.NEUTRAL,
			expansionSet: ExpansionSet.BASE,
			deckAddedCards: [],
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			...getLeaderTextVariables(this),
		}
	}
}
