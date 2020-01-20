import Player from './Player'
import CardHand from './CardHand'
import CardDeck from './CardDeck'

export default class PlayerInGame {
	player: Player
	cardHand: CardHand
	cardDeck: CardDeck
	morale: number
	timeUnits: number

	constructor(player: Player) {
		this.player = player
		this.morale = 0
		this.timeUnits = 0
		this.cardHand = new CardHand([])
		this.cardDeck = new CardDeck([])
	}
}
