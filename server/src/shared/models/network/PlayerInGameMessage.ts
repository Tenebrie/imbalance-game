import PlayerInGame from '../PlayerInGame'
import PlayerMessage from './PlayerMessage'
import CardHandMessage from './CardHandMessage'
import CardDeckMessage from './CardDeckMessage'

export default class PlayerInGameMessage {
	player: PlayerMessage
	cardHand: CardHandMessage
	cardDeck: CardHandMessage

	constructor(playerInGame: PlayerInGame) {
		this.player = PlayerMessage.fromPlayer(playerInGame.player)
		this.cardHand = CardHandMessage.fromHand(playerInGame.cardHand)
		this.cardDeck = CardDeckMessage.fromDeck(playerInGame.cardDeck)
	}

	static fromPlayerInGame(playerInGame: PlayerInGame): PlayerInGameMessage {
		return new PlayerInGameMessage(playerInGame)
	}
}
