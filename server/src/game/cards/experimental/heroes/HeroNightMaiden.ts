import HeroSatia from './HeroSatia'
import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import CardTribe from '../../../shared/enums/CardTribe'
import CardColor from '../../../shared/enums/CardColor'

export default class HeroNightMaiden extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE)
		this.basePower = 40
		this.baseAttack = 7 // 35
		this.baseHealthArmor = 1 // 10
		this.cardTribes = [CardTribe.DRAGON] // 5
	}

	onAfterOtherUnitDestroyed(thisUnit: ServerCardOnBoard, destroyedUnit: ServerCardOnBoard): void {
		if (destroyedUnit.card instanceof HeroSatia) {
			thisUnit.destroy()
		}
	}
}
