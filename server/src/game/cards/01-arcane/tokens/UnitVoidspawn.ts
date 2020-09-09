import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class UnitVoidspawn extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.TOKEN,
			faction: CardFaction.ARCANE,
			stats: {
				power: 1,
			},
			expansionSet: ExpansionSet.BASE,
		})
	}
}
