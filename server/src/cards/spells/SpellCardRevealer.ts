import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'
import ServerPlayerInGame from '../../libraries/players/ServerPlayerInGame'

export default class SpellCardRevealer extends ServerCard {
	constructor() {
		super('SpellCardRevealer')
	}

	onPlay(game: ServerGame, activePlayer: ServerPlayerInGame): void {
		const opponent = game.getOpponent(activePlayer)
		if (opponent.cardHand.isEmpty()) {
			return
		}
		opponent.cardHand.getRandomCard().reveal(game, activePlayer)
	}
}
