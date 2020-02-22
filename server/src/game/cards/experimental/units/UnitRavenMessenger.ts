import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import CardColor from '../../../shared/enums/CardColor'

export default class UnitRavenMessenger extends ServerCard {
	turnsLeft: number

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE)
		this.basePower = 18
		this.baseAttack = 4
		this.baseAttackRange = 2

		this.turnsLeft = 3
	}

	onTurnStarted(thisUnit: ServerCardOnBoard): void {
		this.turnsLeft -= 1
		if (this.turnsLeft === 0) {
			thisUnit.owner.drawUnitCards(1)
			this.turnsLeft = 3
		}
	}
}
