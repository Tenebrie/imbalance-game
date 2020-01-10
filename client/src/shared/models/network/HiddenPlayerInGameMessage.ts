import PlayerInGame from '../PlayerInGame'
import PlayerMessage from './PlayerMessage'
import HiddenCardHandMessage from './HiddenCardHandMessage'
import HiddenCardDeckMessage from './HiddenCardDeckMessage'

export default class HiddenPlayerInGameMessage {
	player: PlayerMessage
	cardHand: HiddenCardHandMessage
	cardDeck: HiddenCardDeckMessage
	rowsOwned: number
	timeUnits: number

	constructor(playerInGame: PlayerInGame) {
		this.player = PlayerMessage.fromPlayer(playerInGame.player)
		this.cardHand = HiddenCardHandMessage.fromHand(playerInGame.cardHand)
		this.cardDeck = HiddenCardDeckMessage.fromDeck(playerInGame.cardDeck)
		this.rowsOwned = playerInGame.rowsOwned
		this.timeUnits = playerInGame.timeUnits
	}

	static fromPlayerInGame(playerInGame: PlayerInGame): HiddenPlayerInGameMessage {
		return new HiddenPlayerInGameMessage(playerInGame)
	}
}
