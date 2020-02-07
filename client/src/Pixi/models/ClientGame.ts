import GameTurnPhase from '@/Pixi/shared/enums/GameTurnPhase'
import Core from '@/Pixi/Core'
import Card from '@/Pixi/shared/models/Card'

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

	public findCardById(cardId: string): Card | null {
		const players = [Core.player, Core.opponent]

		const cardInStack = Core.resolveStack.findCardById(cardId)
		if (cardInStack) {
			return cardInStack
		}
		for (let i = 0; i < players.length; i++) {
			const player = players[i]
			const cardInHand = player.cardHand.findCardById(cardId)
			if (cardInHand) {
				return cardInHand
			}
			const cardInDeck = player.cardDeck.findCardById(cardId)
			if (cardInDeck) {
				return cardInDeck
			}
			const cardInGraveyard = player.cardGraveyard.findCardById(cardId)
			if (cardInGraveyard) {
				return cardInGraveyard
			}
		}
		return null
	}
}
