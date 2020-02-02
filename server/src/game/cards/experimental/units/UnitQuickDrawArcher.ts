import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitQuickDrawArcher extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 17
		this.baseAttack = 2
		this.attackRange = 2
	}


}
