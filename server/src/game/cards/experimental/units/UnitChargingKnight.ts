import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import ServerGameBoardRow from '../../../models/ServerGameBoardRow'
import ServerTargetDefinition from '../../../models/ServerTargetDefinition'
import TargetMode from '../../../shared/enums/TargetMode'
import TargetType from '../../../shared/enums/TargetType'

export default class UnitChargingKnight extends ServerCard {
	hasDamageBonus = false

	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 26
		this.baseAttack = 4
	}

	getUnitOrderTargetDefinition(): ServerTargetDefinition {
		return ServerTargetDefinition.defaultUnitOrder(this.game)
			.setTotalTargets(2)
			.allowSimultaneously([TargetMode.ORDER_ATTACK, TargetType.UNIT], [TargetMode.ORDER_MOVE, TargetType.BOARD_ROW])
	}

	onAfterPerformingUnitAttack(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): void {
		if (this.hasDamageBonus) {
			target.dealDamage(ServerDamageInstance.fromUnit(this.attack, thisUnit))
		}
	}

	onAfterPerformingMove(thisUnit: ServerCardOnBoard, target: ServerGameBoardRow): void {
		this.hasDamageBonus = true
	}

	getBonusAttackDamage(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): number {
		if (this.hasDamageBonus) {
			return this.attack
		}
	}
}
