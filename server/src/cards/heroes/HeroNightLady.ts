import HeroSatia from './HeroSatia'
import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'
import ServerCardOnBoard from '../../libraries/game/ServerCardOnBoard'

export default class HeroNightLady extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, 'heroNightLady')
		this.baseAttack = 20
		this.baseHealth = 20
		this.baseInitiative = 7
	}

	onAfterOtherUnitDestroyed(thisUnit: ServerCardOnBoard, destroyedUnit: ServerCardOnBoard): void {
		if (destroyedUnit.card instanceof HeroSatia) {
			thisUnit.setInitiative(0)
		}
	}
}
