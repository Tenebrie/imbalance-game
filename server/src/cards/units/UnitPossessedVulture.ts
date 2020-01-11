import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'
import ServerCardOnBoard from '../../libraries/game/ServerCardOnBoard'

export default class UnitPossessedVulture extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, 'unitPossessedVulture')
		this.baseAttack = 4
		this.baseHealth = 2
		this.baseInitiative = 2
	}

	onAfterPerformingAttack(thisUnit: ServerCardOnBoard): void {
		thisUnit.setHealth(this.health + 2)
	}
}
