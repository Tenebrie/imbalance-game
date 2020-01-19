import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerCardOnBoard from '../../models/ServerCardOnBoard'
import GameTurnPhase from '../../shared/enums/GameTurnPhase'
import CardTribe from '../../shared/enums/CardTribe'

export default class UnitRavenMessenger extends ServerCard {
	turnsLeft: number

	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 5
		this.baseAttack = 4
		this.baseAttackRange = 3
		this.cardTribes = [CardTribe.BIRD]

		this.turnsLeft = 3
	}

	onTurnPhaseChanged(thisUnit: ServerCardOnBoard, phase: GameTurnPhase): void {
		if (phase !== GameTurnPhase.TURN_START) {
			return
		}

		this.turnsLeft -= 1
		if (this.turnsLeft === 0) {
			thisUnit.owner.drawCards(1)
			this.turnsLeft = 3
		}
	}
}
