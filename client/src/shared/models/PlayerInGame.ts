import Player from './Player'
import CardHand from './CardHand'
import CardDeck from './CardDeck'

export default class PlayerInGame {
	player: Player
	cardHand: CardHand
	cardDeck: CardDeck
	rowsOwned: number
	timeUnits: number

	constructor(player: Player) {
		this.player = player
		this.rowsOwned = 0
		this.timeUnits = 0
		this.cardHand = new CardHand([])
		this.cardDeck = new CardDeck([])
	}
}
