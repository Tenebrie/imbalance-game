import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import CardColor from '../../../shared/enums/CardColor'

export default class UnitPossessedVulture extends ServerCard {
	bonusPower = 4
	bonusAttack = 1

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE)
		this.basePower = 26
		this.baseAttack = 4 // 20
		this.baseAttackRange = 2 // 30
		this.cardTextVariables = {
			bonusPower: this.bonusPower,
			bonusAttack: this.bonusAttack
		}
	}

	onAfterPerformingUnitAttack(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): void {
		if (target.isDead()) {
			thisUnit.setPower(thisUnit.card.power + 4)
		}
	}
}
