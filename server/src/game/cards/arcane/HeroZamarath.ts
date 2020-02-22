import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerCardOnBoard from '../../models/ServerCardOnBoard'
import ServerDamageInstance from '../../models/ServerDamageSource'
import CardColor from '../../shared/enums/CardColor'

export default class HeroZamarath extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN)
		this.basePower = 15
	}

	getDamageTaken(thisUnit: ServerCardOnBoard, damageSource: ServerDamageInstance): number {
		return 0
	}
}
