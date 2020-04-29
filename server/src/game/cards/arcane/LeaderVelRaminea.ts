import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'

export default class LeaderVelRaminea extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.LEADER, CardFaction.ARCANE)
		this.basePower = 0
		this.sortPriority = 1
	}
}
