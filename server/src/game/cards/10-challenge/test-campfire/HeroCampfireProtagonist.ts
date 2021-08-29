import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardFeature from '@src/../../shared/src/enums/CardFeature'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import HeroCampfireBodge from './HeroCampfireBodge'
import HeroCampfireElsa from './HeroCampfireElsa'
import HeroCampfireNira from './HeroCampfireNira'
import UnitCampfireEmptySpace from './UnitCampfireEmptySpace'

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
