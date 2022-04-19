import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import GwentPrizeWinningCow from '../silver/GwentPrizeWinningCow'

export default class GwentChort extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.RELICT],
			stats: {
				power: 14,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentPrizeWinningCow],
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: 'Chort',
				description: 'No ability.',
				flavor: 'A member of the Bovine Defense Force. Semper fi!',
			},
		})
	}
}
