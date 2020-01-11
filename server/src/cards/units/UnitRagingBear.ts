import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'
import GameTurnPhase from '../../shared/enums/GameTurnPhase'
import ServerCardOnBoard from '../../libraries/game/ServerCardOnBoard'

export default class UnitRagingBear extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, 'unitRagingBear')
		this.baseAttack = 12
		this.baseHealth = 15
		this.baseInitiative = 5
	}

	onTurnPhaseChanged(thisUnit: ServerCardOnBoard, phase: GameTurnPhase): void {
		if (thisUnit.card.initiative > 0 || this.game.turnPhase !== GameTurnPhase.COMBAT) {
			return
		}

		this.attackRandomTarget(thisUnit)
	}

	onInitiativeChanged(thisUnit: ServerCardOnBoard, newValue: number, oldValue: number): void {
		if (newValue > 0 || this.game.turnPhase !== GameTurnPhase.COMBAT) {
			return
		}

		this.attackRandomTarget(thisUnit)
	}

	private attackRandomTarget(thisUnit: ServerCardOnBoard) {
		const attackTargets = thisUnit.getValidAttackTargets()
		if (attackTargets.length === 0) {
			return
		}
		const target = attackTargets[Math.floor(Math.random() * attackTargets.length)]
		this.game.board.queueCardAttack(thisUnit, target)
		thisUnit.setInitiative(thisUnit.card.baseInitiative)
	}
}
