import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import BuffProtector from '../../../buffs/BuffProtector'

export default class UnitShieldbearer extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.HUMAN,
			stats: {
				power: 20,
				armor: 7,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.buffs.add(BuffProtector, this)
	}
}
