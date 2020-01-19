import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerCardOnBoard from '../../models/ServerCardOnBoard'
import GameTurnPhase from '../../shared/enums/GameTurnPhase'
import ServerDamageInstance from '../../models/ServerDamageSource'

export default class UnitUnfeelingWarrior extends ServerCard {
	attacksSurvived = 0

	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 18
		this.baseAttack = 5
	}

	onTurnPhaseChanged(thisUnit: ServerCardOnBoard, phase: GameTurnPhase): void {
		if (phase !== GameTurnPhase.TURN_START) {
			return
		}

		thisUnit.heal(ServerDamageInstance.fromUnit(this.attacksSurvived * 3, thisUnit))
		this.attacksSurvived = 0
	}

	onAfterBeingAttacked(thisUnit: ServerCardOnBoard, attacker: ServerCardOnBoard): void {
		this.attacksSurvived += 1
	}
}
