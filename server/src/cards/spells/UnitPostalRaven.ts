import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'
import ServerCardOnBoard from '../../libraries/game/ServerCardOnBoard'

export default class UnitPostalRaven extends ServerCard {
	constructor() {
		super(CardType.UNIT, 'unitPostalRaven')
		this.baseAttack = 1
		this.baseHealth = 1
		this.baseInitiative = 1
	}

	onPlayUnit(game: ServerGame, cardOnBoard: ServerCardOnBoard): void {
		cardOnBoard.owner.drawCards(game, 1)
	}
}
