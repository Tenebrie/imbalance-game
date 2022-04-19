import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import GwentGloriousHunt from '../../neutral/silver/GwentGloriousHunt'

export default class GwentImperialManticore extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.BEAST],
			stats: {
				power: 13,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentGloriousHunt],
		})

		this.createLocalization({
			en: {
				name: 'Imperial Manticore',
				description: 'No ability.',
				flavor:
					"One of the world's oldest and deadliest monsters. I used to feel excitement at moments like this. Now the beast is only an obstacle in my way. Its meat and hot blood will help me survive this icy hell.",
			},
		})
	}
}
