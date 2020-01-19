import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'
import ServerCardOnBoard from '../../libraries/game/ServerCardOnBoard'
import GameTurnPhase from '../../shared/enums/GameTurnPhase'
import ServerDamageInstance from '../../models/ServerDamageSource'

export default class UnitTwinBowArcher extends ServerCard {
	attacksSurvived = 0

	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 4
		this.baseAttack = 6
		this.attackRange = 3
	}

	onBeforePerformingAttack(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): void {
		const rowWithCard = this.game.board.getRowWithCard(target)
		const targetUnitIndex = rowWithCard.cards.indexOf(target)
		const unitOnLeft = rowWithCard.cards[targetUnitIndex - 1]
		const unitOnRight = rowWithCard.cards[targetUnitIndex + 1]
		let secondaryTarget
		if (unitOnLeft && unitOnRight) {
			secondaryTarget = Math.random() < 0.5 ? unitOnLeft : unitOnRight
		} else if (unitOnLeft) {
			secondaryTarget = unitOnLeft
		} else if (unitOnRight) {
			secondaryTarget = unitOnRight
		} else {
			return
		}

		secondaryTarget.dealDamageWithoutDestroying(ServerDamageInstance.fromUnit(thisUnit.card.attack, thisUnit))
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
