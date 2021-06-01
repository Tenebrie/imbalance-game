import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import CardFeature from '@src/../../shared/src/enums/CardFeature'
import HeroCampfireNira from './HeroCampfireNira'
import HeroCampfireBodge from './HeroCampfireBodge'
import UnitCampfireEmptySpace from './UnitCampfireEmptySpace'
import HeroCampfireElsa from './HeroCampfireElsa'

export default class HeroCampfireProtagonist extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.QUICK],
			stats: {
				power: 15,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
		this.createPlayTargets().require((args) => {
			const adjacentUnits = this.game.board.getAdjacentUnits(args)
			return !!adjacentUnits
				.map((unit) => unit.card)
				.find(
					(unit) =>
						unit instanceof HeroCampfireNira ||
						unit instanceof HeroCampfireBodge ||
						unit instanceof UnitCampfireEmptySpace ||
						unit instanceof HeroCampfireElsa
				)
		})
	}
}
