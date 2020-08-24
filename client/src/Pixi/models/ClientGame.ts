import GameTurnPhase from '@shared/enums/GameTurnPhase'
import Core from '@/Pixi/Core'
import Card from '@shared/models/Card'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardMessage from '@shared/models/network/CardMessage'
import Buff from '@shared/models/Buff'
import BuffMessage from '@shared/models/network/BuffMessage'

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

	public findCardById(cardId: string): Card | RenderedCard | CardMessage | null {
		const players = [Core.player, Core.opponent]

		const cardInLimbo = Core.input.cardLimbo.find(card => card.id === cardId)
		if (cardInLimbo) {
			return cardInLimbo
		}

		const cardOnBoard = Core.board.findUnitById(cardId)
		if (cardOnBoard) {
			return cardOnBoard.card
		}

		const cardInStack = Core.resolveStack.findCardById(cardId)
		if (cardInStack) {
			return cardInStack
		}

		const cardInRequiredTargets = Core.input.forcedTargetingCards.find(card => card.id === cardId)
		if (cardInRequiredTargets) {
			return cardInRequiredTargets
		}

		for (let i = 0; i < players.length; i++) {
			const player = players[i]
			if (player.leader && player.leader.id === cardId) {
				return player.leader
			}
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

	public findBuffById(buffId: string): Buff | BuffMessage | null {
		const players = [Core.player, Core.opponent]

		let cards: (Card | CardMessage)[] = Core.board.getAllUnits().map(unit => unit.card)
			.concat(Core.resolveStack.cards)

		for (let i = 0; i < players.length; i++) {
			const player = players[i]
			cards = cards.concat(player.leader)
			cards = cards.concat(player.cardHand.allCards)
			cards = cards.concat(player.cardDeck.allCards)
			cards = cards.concat(player.cardGraveyard.allCards)
		}

		const buffs = cards.reduce((acc, value) => acc.concat(value.buffs.buffs), [])
		return buffs.find(buff => buff.id === buffId)
	}

	public findRenderedCardById(cardId: string): RenderedCard | null {
		const card = this.findCardById(cardId)
		if (!card || !(card instanceof RenderedCard)) {
			return null
		}
		return card
	}
}
