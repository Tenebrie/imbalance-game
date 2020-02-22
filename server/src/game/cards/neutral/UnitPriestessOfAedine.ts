import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import TargetType from '../../shared/enums/TargetType'
import TargetDefinitionBuilder from '../../models/targetDefinitions/TargetDefinitionBuilder'
import SimpleTargetDefinitionBuilder from '../../models/targetDefinitions/SimpleTargetDefinitionBuilder'
import ServerCardOnBoard from '../../models/ServerCardOnBoard'
import ServerDamageInstance from '../../models/ServerDamageSource'
import CardColor from '../../shared/enums/CardColor'
import TargetMode from '../../shared/enums/TargetMode'

export default class UnitPriestessOfAedine extends ServerCard {
	targets = 1
	healing = 5

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE)
		this.basePower = 8
		this.baseAttackRange = 1
		this.cardTextVariables = {
			targets: this.targets,
			healing: this.healing
		}
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return SimpleTargetDefinitionBuilder.base(this.game, TargetMode.POST_PLAY_REQUIRED_TARGET)
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
