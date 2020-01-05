import ServerPlayer from './ServerPlayer'
import Deck from '../../../../common/Deck'
import PlayerInGame from '../../../../common/PlayerInGame'

export default class ServerPlayerInGame extends PlayerInGame {
	player: ServerPlayer
	deck: Deck
	rowsOwned: number

	constructor(player: ServerPlayer, deck: Deck) {
		super(player, deck)
	}

	static newInstance(player: ServerPlayer, deck: Deck) {
		return new ServerPlayerInGame(player, deck)
	}
}
