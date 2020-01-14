import HeroSatia from './HeroSatia'
import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'
import ServerCardOnBoard from '../../libraries/game/ServerCardOnBoard'

export default class HeroNightLady extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, 'heroNightLady')
		this.basePower = 10
		this.baseAttack = 20
	}

	onAfterOtherUnitDestroyed(thisUnit: ServerCardOnBoard, destroyedUnit: ServerCardOnBoard): void {
		if (destroyedUnit.card instanceof HeroSatia) {
			thisUnit.setAttack(thisUnit.card.power)
		}
	}
}
