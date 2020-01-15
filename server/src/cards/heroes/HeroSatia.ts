import HeroNightLady from './HeroNightLady'
import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'
import ServerCardOnBoard from '../../libraries/game/ServerCardOnBoard'
import CardLibrary from '../../libraries/card/CardLibrary'

export default class HeroSatia extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 10
		this.baseAttack = 3
	}

	onPlayUnit(thisUnit: ServerCardOnBoard): void {
		const rowWithCard = this.game.board.getRowWithCard(thisUnit)!
		const cardUnitIndex = rowWithCard.cards.indexOf(thisUnit)

		const nightLady = CardLibrary.createCard(new HeroNightLady(this.game))
		rowWithCard.playCard(nightLady, thisUnit.owner, cardUnitIndex + 1)
	}
}
