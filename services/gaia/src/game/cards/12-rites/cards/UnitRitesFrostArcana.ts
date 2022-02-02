import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'

import BuffProtector from '../../../buffs/BuffProtector'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

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
