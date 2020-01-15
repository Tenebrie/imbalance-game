import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'
import ServerCardOnBoard from '../../libraries/game/ServerCardOnBoard'

export default class UnitPostalRaven extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = Math.ceil(Math.random() * 15)
		this.baseAttack = 1
	}

	onPlayUnit(thisUnit: ServerCardOnBoard): void {
		thisUnit.owner.drawCards(1)
	}
}
