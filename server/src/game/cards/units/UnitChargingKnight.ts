import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerCardOnBoard from '../../models/ServerCardOnBoard'
import GameTurnPhase from '../../shared/enums/GameTurnPhase'
import ServerDamageInstance from '../../models/ServerDamageSource'
import ServerGameBoardRow from '../../models/ServerGameBoardRow'
import UnitOrderType from '../../shared/enums/UnitOrderType'

export default class UnitChargingKnight extends ServerCard {
	hasMovedThisTurn = false
	hasDamageBonus = false

	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 26
		this.baseAttack = 4
	}

	onTurnPhaseChanged(thisUnit: ServerCardOnBoard, phase: GameTurnPhase): void {
		if (phase !== GameTurnPhase.TURN_START) {
			return
		}

		this.hasDamageBonus = this.hasMovedThisTurn
		this.hasMovedThisTurn = false
	}

	onBeforePerformingAttack(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): void {
		if (this.hasDamageBonus) {
			target.dealDamageWithoutDestroying(ServerDamageInstance.fromUnit(this.attack, thisUnit))
		}
	}

	onAfterPerformingMove(thisUnit: ServerCardOnBoard, target: ServerGameBoardRow): void {
		this.hasMovedThisTurn = true
	}

	canPerformOrdersSimultaneously(thisUnit: ServerCardOnBoard, firstOrder: UnitOrderType, secondOrder: UnitOrderType): boolean {
		return firstOrder === UnitOrderType.ATTACK && secondOrder === UnitOrderType.MOVE
	}

	getMaxOrdersTotal(thisUnit: ServerCardOnBoard): number {
		return 2
	}
}
