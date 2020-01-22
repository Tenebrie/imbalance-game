import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerCardOnBoard from '../../models/ServerCardOnBoard'
import ServerDamageInstance from '../../models/ServerDamageSource'

export default class UnitForestScout extends ServerCard {
	hasChargedAttack = true
	hasAttackedThisTurn = false

	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 8
		this.baseAttack = 5
		this.baseAttackRange = 3
	}

	onBeforePerformingAttack(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): void {
		if (this.hasChargedAttack) {
			target.dealDamageWithoutDestroying(ServerDamageInstance.fromUnit(7, thisUnit))
			this.hasChargedAttack = false
		}
		this.hasAttackedThisTurn = true
	}

	onTurnEnded(thisUnit: ServerCardOnBoard): void {
		if (!this.hasAttackedThisTurn) {
			this.hasChargedAttack = true
		}
		this.hasAttackedThisTurn = false
	}
}
