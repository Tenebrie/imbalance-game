import GameTurnPhase from '@shared/enums/GameTurnPhase'
import Core from '@/Pixi/Core'
import Card from '@shared/models/Card'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardMessage from '@shared/models/network/CardMessage'

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

	public findCardById(cardId: string): Card | CardMessage | null {
		const players = [Core.player, Core.opponent]

		const cardOnBoard = Core.board.findUnitById(cardId)
		if (cardOnBoard) {
			return cardOnBoard.card
		}

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

	public findRenderedCardById(cardId: string): RenderedCard | null {
		const card = this.findCardById(cardId)
		if (!card || !(card instanceof RenderedCard)) {
			return null
		}
		return card
	}
}
