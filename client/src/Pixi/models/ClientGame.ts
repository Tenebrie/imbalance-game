import Core from '@/Pixi/Core'
import Card from '@shared/models/Card'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import Buff from '@shared/models/Buff'
import CardMessage from '@shared/models/network/card/CardMessage'
import BuffMessage from '@shared/models/network/buffs/BuffMessage'
import OwnedClientCard from '@/Pixi/cards/OwnedClientCard'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import store from '@/Vue/store'
import CardLocation from '@shared/enums/CardLocation'
import GroupOwnedClientCard from '@/Pixi/cards/GroupOwnedClientCard'

export default class ClientGame {
	public get turnPhase(): GameTurnPhase {
		return store.state.gameStateModule.turnPhase
	}

	public findCardById(cardId: string, priority: CardLocation[] = []): Card | RenderedCard | CardMessage | null {
		const result: { card: Card | RenderedCard | CardMessage; location: CardLocation }[] = []

		const cardOnBoard = Core.board.findUnitById(cardId)
		if (cardOnBoard) {
			result.push({ card: cardOnBoard.card, location: CardLocation.BOARD })
		}

		const cardInStack = Core.resolveStack.findCardById(cardId)
		if (cardInStack) {
			result.push({ card: cardInStack.card, location: CardLocation.STACK })
		}

		const cardInRequiredTargets = Core.input.forcedTargetingCards.find((card) => card.id === cardId)
		if (cardInRequiredTargets) {
			result.push({ card: cardInRequiredTargets, location: CardLocation.UNKNOWN })
		}

		const players = Core.allPlayers
		for (let i = 0; i < players.length; i++) {
			const player = players[i]
			if (!player) {
				continue
			}

			if (player.leader && player.leader.id === cardId) {
				result.push({ card: player.leader, location: CardLocation.LEADER })
			}
			const cardInHand = player.cardHand.findCardById(cardId)
			if (cardInHand) {
				result.push({ card: cardInHand, location: CardLocation.HAND })
			}
			const cardInDeck = player.cardDeck.findCardById(cardId)
			if (cardInDeck) {
				result.push({ card: cardInDeck, location: CardLocation.DECK })
			}
			const cardInGraveyard = player.cardGraveyard.findCardById(cardId)
			if (cardInGraveyard) {
				result.push({ card: cardInGraveyard, location: CardLocation.GRAVEYARD })
			}
		}

		const cardInLimbo = Core.input.cardLimbo.find((card) => card.id === cardId)
		if (cardInLimbo) {
			result.push({ card: cardInLimbo, location: CardLocation.UNKNOWN })
		}

		if (result.length === 0) {
			return null
		}
		return result
			.sort((a, b) => {
				return priority.includes(a.location) && priority.includes(b.location)
					? priority.indexOf(a.location) - priority.indexOf(b.location)
					: priority.includes(a.location)
					? -1
					: priority.includes(b.location)
					? 1
					: 0
			})
			.map((result) => result.card)[0]
	}

	public findOwnedCardById(cardId: string): OwnedClientCard | GroupOwnedClientCard | null {
		const cardOnBoard = Core.board.findUnitById(cardId)
		if (cardOnBoard) {
			return cardOnBoard
		}
		return this.findOwnedPlayerCardById(cardId)
	}

	public findOwnedPlayerCardById(cardId: string): OwnedClientCard | null {
		const cardInStack = Core.resolveStack.findCardById(cardId)
		if (cardInStack) {
			return cardInStack
		}

		const players = [Core.player, Core.opponent]
		for (let i = 0; i < players.length; i++) {
			const playerGroup = players[i]
			for (let u = 0; u < playerGroup.players.length; u++) {
				const player = playerGroup.players[u]
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
			const playerGroup = players[i]!
			playerGroup.players.forEach((player) => {
				cards = cards.concat(player.leader)
				cards = cards.concat(player.cardHand.allCards)
				cards = cards.concat(player.cardDeck.allCards)
				cards = cards.concat(player.cardGraveyard.allCards)
			})
		}

		const buffs = cards.reduce<(Buff | BuffMessage)[]>((acc, value) => acc.concat(value.buffs.buffs), [])
		return buffs.find((buff) => buff.id === buffId) || null
	}

	public findRenderedCardById(cardId: string, priority: CardLocation[] = []): RenderedCard | null {
		if (!cardId || !Core.isReady) {
			return null
		}
		const card = this.findCardById(cardId, priority)
		if (!card || !(card instanceof RenderedCard)) {
			return null
		}
		return card
	}
}
