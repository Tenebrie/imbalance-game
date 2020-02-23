import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerCardOnBoard from '../../models/ServerCardOnBoard'
import ServerGameBoardRow from '../../models/ServerGameBoardRow'
import ServerTargetDefinition from '../../models/targetDefinitions/ServerTargetDefinition'
import TargetMode from '../../shared/enums/TargetMode'
import TargetType from '../../shared/enums/TargetType'
import TargetDefinitionBuilder from '../../models/targetDefinitions/TargetDefinitionBuilder'
import CardColor from '../../shared/enums/CardColor'

export default class UnitChargingKnight extends ServerCard {
	hasMovedThisTurn = false

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE)
		this.basePower = 10
		this.baseAttack = 2
	}

	defineValidOrderTargets(): TargetDefinitionBuilder {
		let orderTargets = ServerTargetDefinition.defaultUnitOrder(this.game)
		if (this.hasMovedThisTurn) {
			orderTargets = orderTargets
				.actions(1)
				.allow(TargetMode.ORDER_ATTACK, TargetType.UNIT)
				.allowSimultaneously([TargetMode.ORDER_ATTACK, TargetType.UNIT], [TargetMode.ORDER_MOVE, TargetType.BOARD_ROW])
		}
		return orderTargets
	}

	onAfterPerformingMove(thisUnit: ServerCardOnBoard, target: ServerGameBoardRow): void {
		this.hasMovedThisTurn = true
	}

	onTurnEnded(thisUnit: ServerCardOnBoard): void {
		this.hasMovedThisTurn = false
	}
}
