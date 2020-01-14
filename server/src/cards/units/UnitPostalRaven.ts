import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'
import ServerCardOnBoard from '../../libraries/game/ServerCardOnBoard'

export default class UnitPostalRaven extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, 'unitPostalRaven')
		this.basePower = 10
		this.baseAttack = 1
	}

	onPlayUnit(thisUnit: ServerCardOnBoard): void {
		thisUnit.owner.drawCards(1)
	}
}
