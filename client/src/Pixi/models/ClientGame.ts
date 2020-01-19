import GameTurnPhase from '@/Pixi/shared/enums/GameTurnPhase'
import Core from '@/Pixi/Core'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import AttackOrder from '@/Pixi/shared/models/AttackOrder'

export default class ClientGame {
	currentTime: number
	maximumTime: number
	turnPhase: GameTurnPhase

	constructor() {
		this.currentTime = 0
		this.maximumTime = 1
		this.turnPhase = GameTurnPhase.BEFORE_GAME
	}

	public setTurnPhase(phase: GameTurnPhase): void {
		this.turnPhase = phase

		if (phase === GameTurnPhase.SKIRMISH) {
			const cards = Core.board.getCardsOwnedByPlayer(Core.player).filter(unit => !!unit.preferredAttackTarget)
			cards.forEach(unit => {
				OutgoingMessageHandlers.sendUnitAttackOrders(new AttackOrder(unit, unit.preferredAttackTarget!))
			})
		}
	}
}
