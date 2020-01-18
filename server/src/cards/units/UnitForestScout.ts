import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'

export default class UnitForestScout extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 55
		this.baseAttack = 1
		this.attackRange = 3
	}
}
