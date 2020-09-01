import PlayerInGame from '../../PlayerInGame'
import PlayerMessage from '../PlayerMessage'
import OpenCardHandMessage from '../cardHand/OpenCardHandMessage'
import OpenCardDeckMessage from '../cardDeck/OpenCardDeckMessage'

export default class OpenPlayerInGameMessage {
	player: PlayerMessage
	cardHand: OpenCardHandMessage
	cardDeck: OpenCardDeckMessage
	morale: number
	unitMana: number
	spellMana: number

	constructor(playerInGame: PlayerInGame) {
		this.player = new PlayerMessage(playerInGame.player)
		this.cardHand = new OpenCardHandMessage(playerInGame.cardHand)
		this.cardDeck = new OpenCardDeckMessage(playerInGame.cardDeck)
		this.morale = playerInGame.morale
		this.unitMana = playerInGame.unitMana
		this.spellMana = playerInGame.spellMana
	}
}
