import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import ServerUnit from '../../../models/ServerUnit'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import TargetType from '@shared/enums/TargetType'

export default class HeroCultistOfAreddon extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.NEUTRAL)
		this.basePower = 2
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.singleTarget()
			.require(TargetType.UNIT)
			.alliedUnit()
			.notSelf()
	}

	onUnitPlayTargetUnitSelected(thisUnit: ServerUnit, target: ServerUnit): void {
		const cardClass = target.card.class
		target.destroy()
		this.owner.createCardFromLibraryByClass(cardClass)
	}
}
