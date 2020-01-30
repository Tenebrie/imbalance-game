import GameTurnPhase from '@/Pixi/shared/enums/GameTurnPhase'

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
	}
}
