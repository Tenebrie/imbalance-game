import Card from '../Card'
import CardMessage from './CardMessage'
import PlayerInGame from '../PlayerInGame'
import PlayerMessage from './PlayerMessage'

export default class PlayerInGameMessage {
	player: PlayerMessage
	cardHand: CardMessage[]
	cardDeck: CardMessage[]

	constructor(playerInGame: PlayerInGame) {
		this.player = PlayerMessage.fromPlayer(playerInGame.player)
		this.cardHand = playerInGame.cardHand.cards.map((card: Card) => CardMessage.fromCard(card))
		this.cardDeck = playerInGame.cardDeck.cards.map((card: Card) => CardMessage.fromCard(card))
	}

	static fromPlayerInGame(playerInGame: PlayerInGame): PlayerInGameMessage {
		return new PlayerInGameMessage(playerInGame)
	}
}
