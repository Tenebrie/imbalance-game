import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'

export default class UnitMadBerserker extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 70
		this.baseAttack = 1
	}
}
