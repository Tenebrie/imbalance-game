import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import CardColor from '../../shared/enums/CardColor'
import ServerCardOnBoard from '../../models/ServerCardOnBoard'
import TargetDefinitionBuilder from '../../models/targetDefinitions/TargetDefinitionBuilder'
import ServerTargetDefinition from '../../models/targetDefinitions/ServerTargetDefinition'
import TargetMode from '../../shared/enums/TargetMode'
import TargetType from '../../shared/enums/TargetType'
import BuffExtraMove from '../../buffs/BuffExtraMove'

export default class UnitSupplyWagon extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE)
		this.basePower = 6
	}

	defineValidOrderTargets(): TargetDefinitionBuilder {
		return ServerTargetDefinition.defaultUnitOrder(this.game)
			.singleAction()
			.allow(TargetMode.ORDER_SUPPORT, TargetType.UNIT)
			.alliedUnit(TargetMode.ORDER_SUPPORT)
			.notSelf(TargetMode.ORDER_SUPPORT)
	}

	onPerformingUnitSupport(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): void {
		target.card.cardBuffs.add(new BuffExtraMove(), this)
	}
}
