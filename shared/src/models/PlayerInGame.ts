import CardHand from './CardHand'
import CardDeck from './CardDeck'
import Player from './Player'
import PlayerInGameMessage from './network/PlayerInGameMessage'
import Card from './Card'

export default class PlayerInGame {
	player: Player
	cardHand: CardHand
	cardDeck: CardDeck
	rowsOwned: number

	constructor(player: Player) {
		this.player = player
		this.rowsOwned = 0
		this.cardHand = new CardHand([])
		this.cardDeck = new CardDeck([])
	}

	public static fromPlayer(player: Player): PlayerInGame {
		return new PlayerInGame(player)
	}

	public static fromMessage(message: PlayerInGameMessage): PlayerInGame {
		const player = Player.fromPlayerMessage(message.player)
		const playerInGame = new PlayerInGame(player)
		message.cardHand.forEach(cardMessage => {
			playerInGame.cardHand.addCard(Card.fromMessage(cardMessage))
		})
		message.cardDeck.forEach(cardMessage => {
			playerInGame.cardDeck.addCard(Card.fromMessage(cardMessage))
		})
		return playerInGame
	}
}
