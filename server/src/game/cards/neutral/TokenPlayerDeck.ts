import CardType from '@shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'

export default class TokenPlayerDeck extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.TOKEN, CardColor.TOKEN, CardFaction.NEUTRAL)
		this.sortPriority = 1
	}
}
