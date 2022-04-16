import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import BuffProtector from '../../../buffs/BuffProtector'

export default class UnitRitesFrostArcana extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			stats: {
				power: 0,
				armor: 10,
			},
			expansionSet: ExpansionSet.RITES,
		})

		this.createLocalization({
			en: {
				name: 'Frost Arcana',
				description: ' ',
			},
		})

		this.buffs.add(BuffProtector, this)
	}
}
