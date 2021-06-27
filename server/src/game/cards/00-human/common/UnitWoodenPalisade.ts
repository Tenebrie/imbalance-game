import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardFeature from '@shared/enums/CardFeature'
import BuffProtector from '../../../buffs/BuffProtector'
import CardTribe from '@shared/enums/CardTribe'

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

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit }) => {
			const rightPalisade = new UnitWoodenPalisade(this.game)
			this.game.board.createUnit(rightPalisade, triggeringUnit.rowIndex, triggeringUnit.unitIndex + 1)
		})
	}
}
