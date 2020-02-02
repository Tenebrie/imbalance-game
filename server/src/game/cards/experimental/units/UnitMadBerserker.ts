import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'

export default class UnitMadBerserker extends ServerCard {
	hasAttackedThisTurn = false
	lastAttackTarget: ServerCardOnBoard | null = null
	consecutiveAttackCount = 0

	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 27
		this.baseAttack = 3
	}

	onTurnEnded(thisUnit: ServerCardOnBoard): void {
		if (!this.hasAttackedThisTurn) {
			this.lastAttackTarget = null
			this.consecutiveAttackCount = 0
		}
		this.hasAttackedThisTurn = false
	}

	onBeforePerformingUnitAttack(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): void {
		this.hasAttackedThisTurn = true
		if (target === this.lastAttackTarget) {
			this.consecutiveAttackCount += 1
		} else {
			this.lastAttackTarget = target
			this.consecutiveAttackCount = 0
		}
	}

	getBonusAttackDamage(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): number {
		return this.consecutiveAttackCount * 3
	}
}
