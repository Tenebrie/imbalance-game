import PlayerInGame from '../PlayerInGame'
import PlayerMessage from './PlayerMessage'
import HiddenCardHandMessage from './HiddenCardHandMessage'
import HiddenCardDeckMessage from './HiddenCardDeckMessage'

export default class HiddenPlayerInGameMessage {
	player: PlayerMessage
	cardHand: HiddenCardHandMessage
	cardDeck: HiddenCardDeckMessage
	morale: number
	unitMana: number
	spellMana: number

	constructor(playerInGame: PlayerInGame) {
		this.player = PlayerMessage.fromPlayer(playerInGame.player)
		this.cardHand = new HiddenCardHandMessage(playerInGame.cardHand)
		this.cardDeck = new HiddenCardDeckMessage(playerInGame.cardDeck)
		this.morale = playerInGame.morale
		this.unitMana = playerInGame.unitMana
		this.spellMana = playerInGame.spellMana
	}

	static fromPlayerInGame(playerInGame: PlayerInGame): HiddenPlayerInGameMessage {
		return new HiddenPlayerInGameMessage(playerInGame)
	}
}
