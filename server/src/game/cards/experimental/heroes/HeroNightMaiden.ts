import HeroSatia from './HeroSatia'
import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'
import CardTribe from '@shared/enums/CardTribe'
import CardColor from '@shared/enums/CardColor'

export default class HeroNightMaiden extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE)
		this.basePower = 40
		this.baseAttack = 7 // 35
		this.baseHealthArmor = 1 // 10
		this.tribes = [CardTribe.DRAGON] // 5
	}

	onAfterOtherUnitDestroyed(destroyedUnit: ServerUnit): void {
		if (destroyedUnit.card instanceof HeroSatia) {
			this.unit.destroy()
		}
	}
}
