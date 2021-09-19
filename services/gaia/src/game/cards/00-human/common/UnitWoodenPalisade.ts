import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'

import BuffProtector from '../../../buffs/BuffProtector'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitWoodenPalisade extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.BUILDING],
			features: [CardFeature.NIGHTWATCH],
			stats: {
				power: 0,
				armor: 10,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.buffs.add(BuffProtector, this)

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner, triggeringUnit }) => {
			const rightPalisade = new UnitWoodenPalisade(this.game)
			this.game.board.createUnit(rightPalisade, owner, triggeringUnit.rowIndex, triggeringUnit.unitIndex + 1)
		})
	}
}
