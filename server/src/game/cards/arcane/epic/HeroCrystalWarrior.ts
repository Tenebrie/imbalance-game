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
import CardLibrary from '../../../libraries/CardLibrary'

interface SacrificedUnit {
	rowIndex: number,
	unitIndex: number
}

export default class HeroCrystalWarrior extends ServerCard {
	sacrificedUnit: SacrificedUnit | null = null

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.ARCANE)
		this.basePower = 7
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		if (!this.sacrificedUnit) {
			return PostPlayTargetDefinitionBuilder.base(this.game)
				.multipleTargets(2)
				.require(TargetType.UNIT)
				.alliedUnit()
				.notSelf()
		} else {
			return PostPlayTargetDefinitionBuilder.base(this.game)
				.multipleTargets(2)
				.require(TargetType.CARD_IN_LIBRARY)
				.validate(TargetType.CARD_IN_LIBRARY, args => args.targetCard.tribes.includes(CardTribe.CRYSTAL))
		}
	}

	onUnitPlayTargetUnitSelected(thisUnit: ServerUnit, target: ServerUnit): void {
		this.sacrificedUnit = {
			rowIndex: target.rowIndex,
			unitIndex: target.unitIndex
		}
		target.destroy()
	}

	onUnitPlayTargetCardSelected(thisUnit: ServerUnit, target: ServerCard): void {
		const crystal = CardLibrary.instantiateByInstance(this.game, target)
		this.game.board.createUnit(crystal, this.owner, this.sacrificedUnit.rowIndex, this.sacrificedUnit.unitIndex)
	}

	onUnitPlayTargetsConfirmed(thisUnit: ServerUnit) {
		this.sacrificedUnit = null
	}
}
