import Core from '@/Pixi/Core'
import Card from '@shared/models/Card'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import Buff from '@shared/models/Buff'
import CardMessage from '@shared/models/network/card/CardMessage'
import BuffMessage from '@shared/models/network/buffs/BuffMessage'
import OwnedClientCard from '@/Pixi/cards/OwnedClientCard'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import store from '@/Vue/store'

export default class ClientGame {
	public get turnPhase(): GameTurnPhase {
		return store.state.gameStateModule.turnPhase
	}

	public findCardById(cardId: string): Card | RenderedCard | CardMessage | null {
		const players = [Core.player, Core.opponent]

		const cardOnBoard = Core.board.findUnitById(cardId)
		if (cardOnBoard) {
			return cardOnBoard.card
		}

		const cardInStack = Core.resolveStack.findCardById(cardId)
		if (cardInStack) {
			return cardInStack.card
		}

		const cardInRequiredTargets = Core.input.forcedTargetingCards.find((card) => card.id === cardId)
		if (cardInRequiredTargets) {
			return cardInRequiredTargets
		}

		for (let i = 0; i < players.length; i++) {
			const player = players[i]
			if (!player) {
				continue
			}

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

		const cardInLimbo = Core.input.cardLimbo.find((card) => card.id === cardId)
		if (cardInLimbo) {
			return cardInLimbo
		}
		return null
	}

	public findOwnedCardById(cardId: string): OwnedClientCard | null {
		const cardOnBoard = Core.board.findUnitById(cardId)
		if (cardOnBoard) {
			return cardOnBoard
		}
		const cardInStack = Core.resolveStack.findCardById(cardId)
		if (cardInStack) {
			return cardInStack
		}

		const players = [Core.player, Core.opponent]
		for (let i = 0; i < players.length; i++) {
			const player = players[i]
			const cardAsLeader = player.leader
			if (cardAsLeader && cardAsLeader.id === cardId) {
				return { card: cardAsLeader, owner: player }
			}
			const cardInHand = player.cardHand.findCardById(cardId)
			if (cardInHand) {
				return { card: cardInHand, owner: player }
			}
			const cardInDeck = player.cardDeck.findCardById(cardId)
			if (cardInDeck) {
				return { card: cardInDeck, owner: player }
			}
			const cardInGraveyard = player.cardGraveyard.findCardById(cardId)
			if (cardInGraveyard) {
				return { card: cardInGraveyard, owner: player }
			}
		}
		return null
	}

	public findBuffById(buffId: string): Buff | BuffMessage | null {
		const players = [Core.player, Core.opponent]

		let cards: (Card | CardMessage)[] = Core.board
			.getAllUnits()
			.map((unit) => unit.card)
			.concat(Core.resolveStack.cards.map((ownedCard) => ownedCard.card))

		for (let i = 0; i < players.length; i++) {
			const player = players[i]
			cards = cards.concat(player.leader)
			cards = cards.concat(player.cardHand.allCards)
			cards = cards.concat(player.cardDeck.allCards)
			cards = cards.concat(player.cardGraveyard.allCards)
		}

		const buffs = cards.reduce((acc, value) => acc.concat(value.buffs.buffs), [])
		return buffs.find((buff) => buff.id === buffId)
	}

	public findRenderedCardById(cardId: string): RenderedCard | null {
		if (!cardId) {
			return null
		}
		const card = this.findCardById(cardId)
		if (!card || !(card instanceof RenderedCard)) {
			return null
		}
		return card
	}
}
