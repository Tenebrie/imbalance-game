import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import CardColor from '../../../shared/enums/CardColor'

export default class UnitForestScout extends ServerCard {
	bonusDamage = 10
	hasChargedAttack = true
	hasAttackedThisTurn = false

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE)
		this.basePower = 32
		this.baseAttack = 3 // 15 (with effect - 35)
		this.baseAttackRange = 2 // 30
		this.dynamicTextVariables = {
			bonusDamage: this.bonusDamage
		}
	}

	onBeforePerformingUnitAttack(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): void {
		if (this.hasChargedAttack) {
			target.dealDamageWithoutDestroying(ServerDamageInstance.fromUnit(this.bonusDamage, thisUnit))
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
