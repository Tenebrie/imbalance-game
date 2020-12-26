import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardFeature from '@shared/enums/CardFeature'
import BuffProtector from '../../../buffs/BuffProtector'

export default class UnitWoodenPalisade extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			features: [CardFeature.BUILDING],
			stats: {
				power: 0,
				armor: 5,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.buffs.add(BuffProtector, this)

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit }) => {
			const rightPalisade = new UnitWoodenPalisade(this.game)
			this.game.board.createUnit(rightPalisade, this.ownerInGame, triggeringUnit.rowIndex, triggeringUnit.unitIndex + 1)
		})
	}
}
