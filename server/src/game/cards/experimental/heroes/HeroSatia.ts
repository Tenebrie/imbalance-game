import HeroNightMaiden from './HeroNightMaiden'
import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import CardLibrary from '../../../libraries/CardLibrary'
import CardColor from '../../../shared/enums/CardColor'

export default class HeroSatia extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE)
		this.basePower = 14
		this.baseAttack = 1
	}

	onPlayUnit(thisUnit: ServerCardOnBoard): void {
		const rowWithCard = this.game.board.getRowWithUnit(thisUnit)!
		const cardUnitIndex = rowWithCard.cards.indexOf(thisUnit)

		const nightMaiden = CardLibrary.instantiate(new HeroNightMaiden(this.game))
		rowWithCard.createUnit(nightMaiden, thisUnit.owner, cardUnitIndex + 1)
	}
}
