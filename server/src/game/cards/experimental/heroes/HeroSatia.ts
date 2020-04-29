import HeroNightMaiden from './HeroNightMaiden'
import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'
import CardLibrary from '../../../libraries/CardLibrary'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'

export default class HeroSatia extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.EXPERIMENTAL)
		this.basePower = 14
		this.baseAttack = 1
	}

	onPlayedAsUnit(thisUnit: ServerUnit): void {
		const nightMaiden = CardLibrary.instantiateByInstance(new HeroNightMaiden(this.game))
		this.game.board.createUnit(nightMaiden, thisUnit.owner, thisUnit.rowIndex, thisUnit.unitIndex + 1)
	}
}
