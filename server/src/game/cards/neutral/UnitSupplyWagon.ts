import CardType from '@shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import ServerUnit from '../../models/ServerUnit'
import TargetDefinitionBuilder from '../../models/targetDefinitions/TargetDefinitionBuilder'
import TargetDefinition from '../../models/targetDefinitions/TargetDefinition'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import BuffExtraMove from '../../buffs/BuffExtraMove'

export default class UnitSupplyWagon extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE)
		this.basePower = 6
	}

	defineValidOrderTargets(): TargetDefinitionBuilder {
		return TargetDefinition.defaultUnitOrder(this.game)
			.singleAction()
			.allow(TargetMode.ORDER_SUPPORT, TargetType.UNIT)
			.alliedUnit(TargetMode.ORDER_SUPPORT)
			.notSelf(TargetMode.ORDER_SUPPORT)
	}

	onPerformingUnitSupport(thisUnit: ServerUnit, target: ServerUnit): void {
		target.card.buffs.add(new BuffExtraMove(), this)
	}
}
