import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'
import ServerCardOnBoard from '../../libraries/game/ServerCardOnBoard'

export default class UnitPostalRaven extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, 'unitPostalRaven')
		this.baseAttack = 1
		this.baseHealth = 1
		this.baseInitiative = 2
	}

	onPlayUnit(thisUnit: ServerCardOnBoard): void {
		thisUnit.owner.drawCards(1)
	}
}
