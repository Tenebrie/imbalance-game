import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import ServerGameBoardRow from '../../../models/ServerGameBoardRow'
import ServerTargetDefinition from '../../../models/targetDefinitions/ServerTargetDefinition'
import TargetMode from '../../../shared/enums/TargetMode'
import TargetType from '../../../shared/enums/TargetType'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'

export default class UnitChargingKnight extends ServerCard {
	hasDamageBonus = false

	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 35
		this.baseAttack = 6 // 30 (with effect - 45)
	}

	defineValidOrderTargets(): TargetDefinitionBuilder {
		return ServerTargetDefinition.defaultUnitOrder(this.game)
			.actions(2)
			.allowSimultaneously([TargetMode.ORDER_ATTACK, TargetType.UNIT], [TargetMode.ORDER_MOVE, TargetType.BOARD_ROW])
	}

	onAfterPerformingMove(thisUnit: ServerCardOnBoard, target: ServerGameBoardRow): void {
		this.hasDamageBonus = true
	}

	getBonusAttackDamage(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): number {
		if (this.hasDamageBonus) {
			return this.attack
		}
		this.hasDamageBonus = false
	}
}
