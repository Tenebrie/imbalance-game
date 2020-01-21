import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerCardOnBoard from '../../models/ServerCardOnBoard'
import GameTurnPhase from '../../shared/enums/GameTurnPhase'
import ServerDamageInstance from '../../models/ServerDamageSource'

export default class UnitMadBerserker extends ServerCard {
	hasAttackedThisTurn = false
	lastAttackTarget: ServerCardOnBoard | null = null
	consecutiveAttackCount = 0

	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 17
		this.baseAttack = 3
	}

	onTurnPhaseChanged(thisUnit: ServerCardOnBoard, phase: GameTurnPhase): void {
		if (phase !== GameTurnPhase.TURN_END) { return }

		if (!this.hasAttackedThisTurn) {
			this.lastAttackTarget = null
			this.consecutiveAttackCount = 0
		}
	}

	onBeforePerformingAttack(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): void {
		if (target === this.lastAttackTarget) {
			this.consecutiveAttackCount += 1
		} else {
			this.lastAttackTarget = target
			this.consecutiveAttackCount = 0
		}

		target.dealDamageWithoutDestroying(ServerDamageInstance.fromUnit(this.consecutiveAttackCount * 3, thisUnit))
	}
}
