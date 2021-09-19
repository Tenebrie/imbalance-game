import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import BuffExtraArmor from '@src/game/buffs/BuffExtraArmor'

import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'

export default class TestingUnitExtraArmorSelector extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			tribes: [CardTribe.ELEMENTAL],
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 20,
			},
			expansionSet: ExpansionSet.TESTING,
		})

		this.createSelector().provide(BuffExtraArmor)
	}
}
