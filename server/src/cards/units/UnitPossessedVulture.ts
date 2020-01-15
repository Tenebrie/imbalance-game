import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'
import ServerCardOnBoard from '../../libraries/game/ServerCardOnBoard'

export default class UnitPossessedVulture extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 57
		this.baseAttack = 4
	}

	onAfterPerformingAttack(thisUnit: ServerCardOnBoard): void {
		thisUnit.setPower(this.power + 1)
	}
}
