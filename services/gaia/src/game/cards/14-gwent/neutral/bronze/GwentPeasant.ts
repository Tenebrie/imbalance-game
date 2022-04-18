import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import GwentPeasantMilitia from './GwentPeasantMilitia'

export default class GwentPeasant extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 3,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentPeasantMilitia],
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: 'Peasant',
				description: 'No ability',
				flavor: "Grab your pitchforks, lads and ladettes. Today we're going to militia this place up!",
			},
		})
	}
}
