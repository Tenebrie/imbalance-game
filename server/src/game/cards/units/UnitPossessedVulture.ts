import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerCardOnBoard from '../../models/ServerCardOnBoard'
import CardTribe from '../../shared/enums/CardTribe'

export default class UnitPossessedVulture extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 10
		this.baseAttack = 4
		this.baseAttackRange = 2
		this.cardTribes = [CardTribe.BIRD]
	}

	onAfterPerformingAttack(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): void {
		if (target.isDead()) {
			thisUnit.setPower(thisUnit.card.power + 4)
		}
	}
}
