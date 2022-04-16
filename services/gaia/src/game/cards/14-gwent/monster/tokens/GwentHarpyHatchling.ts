import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import GwentHarpyEgg from '../bronze/GwentHarpyEgg'

export default class GwentHarpyHatchling extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.BEAST],
			stats: {
				power: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentHarpyEgg],
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: 'Harpy Hatchling',
				description: 'No ability',
				flavor: 'Nature sometimes give lie to the phrase "youth is beauty".',
			},
		})
	}
}
