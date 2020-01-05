import Deck from './Deck'
import Player from './Player'

export default class PlayerInGame {
	player: Player
	deck: Deck
	rowsOwned: number

	constructor(player: Player, deck: Deck) {
		this.player = player
		this.deck = deck
		this.rowsOwned = 0
	}

	static newInstance(player: Player, deck: Deck) {
		return new PlayerInGame(player, deck)
	}
}
