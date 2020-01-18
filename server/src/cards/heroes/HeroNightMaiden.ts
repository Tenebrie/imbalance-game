import HeroSatia from './HeroSatia'
import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'
import ServerCardOnBoard from '../../libraries/game/ServerCardOnBoard'
import CardTribe from '../../shared/enums/CardTribe'

export default class HeroNightMaiden extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 28
		this.baseAttack = 7
		this.baseAttackRange = 3
		this.cardTribes = [CardTribe.DRAGON]
	}

	onAfterOtherUnitDestroyed(thisUnit: ServerCardOnBoard, destroyedUnit: ServerCardOnBoard): void {
		if (destroyedUnit.card instanceof HeroSatia) {
			thisUnit.destroy()
		}
	}
}
