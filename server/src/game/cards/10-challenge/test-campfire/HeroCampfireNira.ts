import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import CardTribe from '@src/../../shared/src/enums/CardTribe'

export default class HeroCampfireNira extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.DRYAD],
			stats: {
				power: 15,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
	}
}
