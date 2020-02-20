import PlayerInGame from '../PlayerInGame'
import PlayerMessage from './PlayerMessage'
import CardHandMessage from './CardHandMessage'
import CardDeckMessage from './CardDeckMessage'

export default class PlayerInGameMessage implements PlayerInGame {
	player: PlayerMessage
	cardHand: CardHandMessage
	cardDeck: CardDeckMessage
	morale: number
	unitMana: number
	spellMana: number

	constructor(playerInGame: PlayerInGame) {
		this.player = PlayerMessage.fromPlayer(playerInGame.player)
		this.cardHand = new CardHandMessage(playerInGame.cardHand)
		this.cardDeck = new CardDeckMessage(playerInGame.cardDeck)
		this.morale = playerInGame.morale
		this.unitMana = playerInGame.unitMana
		this.spellMana = playerInGame.spellMana
	}

	static fromPlayerInGame(playerInGame: PlayerInGame): PlayerInGameMessage {
		return new PlayerInGameMessage(playerInGame)
	}
}
