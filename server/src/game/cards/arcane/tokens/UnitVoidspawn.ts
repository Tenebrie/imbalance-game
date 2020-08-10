import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'

export default class UnitVoidspawn extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.TOKEN, CardFaction.ARCANE)
		this.basePower = 1
	}
}
