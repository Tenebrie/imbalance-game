import CardType from '@shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'

export default class UnitTinySparkling extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.TOKEN)
		this.basePower = 2
	}
}
