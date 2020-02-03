import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetType from '../../../shared/enums/TargetType'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import CardPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/CardPlayTargetDefinitionBuilder'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import ServerDamageInstance from '../../../models/ServerDamageSource'

export default class UnitPriestessOfAedine extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 24
		this.baseAttack = 2
		this.baseAttackRange = 2
	}

	definePlayRequiredTargets(): TargetDefinitionBuilder {
		return CardPlayTargetDefinitionBuilder.base(this.game)
			.multiTarget(3)
			.alliedUnit()
			.notSelf()
			.allow(TargetType.UNIT, 3)
			.unique(TargetType.UNIT)
			.inUnitRange(TargetType.UNIT)
			.label(TargetType.UNIT, 'card.target.unitPriestessOfAedine.heal')
			.validate(TargetType.UNIT, args => args.targetUnit.card.power < args.targetUnit.card.basePower)
	}

	onUnitPlayTargetUnitSelected(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): void {
		target.heal(ServerDamageInstance.fromUnit(5, thisUnit))
	}
}
