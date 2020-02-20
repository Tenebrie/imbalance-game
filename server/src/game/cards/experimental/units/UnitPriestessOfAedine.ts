import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetType from '../../../shared/enums/TargetType'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import CardPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/CardPlayTargetDefinitionBuilder'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import ServerDamageInstance from '../../../models/ServerDamageSource'

export default class UnitPriestessOfAedine extends ServerCard {
	targets = 3
	healing = 10

	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 19
		this.baseAttack = 3
		this.baseAttackRange = 2
		this.cardTextVariables = {
			targets: this.targets,
			healing: this.healing
		}
	}

	definePlayRequiredTargets(): TargetDefinitionBuilder {
		return CardPlayTargetDefinitionBuilder.base(this.game)
			.multipleTargets(this.targets)
			.alliedUnit()
			.notSelf()
			.allow(TargetType.UNIT, this.targets)
			.unique(TargetType.UNIT)
			.inUnitRange(TargetType.UNIT)
			.label(TargetType.UNIT, 'card.target.unitPriestessOfAedine.heal')
			.validate(TargetType.UNIT, args => args.targetUnit.card.power < args.targetUnit.card.basePower)
	}

	onUnitPlayTargetUnitSelected(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): void {
		target.heal(ServerDamageInstance.fromUnit(this.healing, thisUnit))
	}
}
