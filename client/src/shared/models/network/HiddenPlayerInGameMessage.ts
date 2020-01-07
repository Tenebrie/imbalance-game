import Card from '../Card'
import PlayerInGame from '../PlayerInGame'
import PlayerMessage from './PlayerMessage'
import HiddenCardMessage from './HiddenCardMessage'

export default class HiddenPlayerInGameMessage {
	player: PlayerMessage
	cardHand: HiddenCardMessage[]
	cardDeck: HiddenCardMessage[]

	constructor(playerInGame: PlayerInGame) {
		this.player = PlayerMessage.fromPlayer(playerInGame.player)
		this.cardHand = playerInGame.cardHand.cards.map((card: Card) => HiddenCardMessage.fromCard(card))
		this.cardDeck = playerInGame.cardDeck.cards.map((card: Card) => HiddenCardMessage.fromCard(card))
	}

	static fromPlayerInGame(playerInGame: PlayerInGame): HiddenPlayerInGameMessage {
		return new HiddenPlayerInGameMessage(playerInGame)
	}
}
