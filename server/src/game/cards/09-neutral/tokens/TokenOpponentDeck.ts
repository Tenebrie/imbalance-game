import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class TokenOpponentDeck extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.TOKEN,
			faction: CardFaction.NEUTRAL,
			sortPriority: 2,
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.BASE,
		})
	}
}
