import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitHarmlessShadow extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.VOIDSPAWN],
			stats: {
				power: 0,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: 'Harmless Shadow',
				description: '<i>No effect</i>',
			},
		})
	}
}
