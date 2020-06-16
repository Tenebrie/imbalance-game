import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import ServerUnit from '../../../models/ServerUnit'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import TargetType from '@shared/enums/TargetType'
import CardTribe from '@shared/enums/CardTribe'

export default class HeroCrystalWarrior extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.ARCANE)
		this.basePower = 7
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.singleTarget()
			.require(TargetType.UNIT)
			.validate(TargetType.UNIT, args => args.targetUnit.card.tribes.includes(CardTribe.CRYSTAL))
	}

	onUnitPlayTargetUnitSelected(thisUnit: ServerUnit, target: ServerUnit): void {
		target.card.onBeforeDestroyedAsUnit(target)
	}
}
