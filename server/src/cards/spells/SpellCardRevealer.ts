import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'
import ServerPlayerInGame from '../../libraries/players/ServerPlayerInGame'

export default class SpellCardRevealer extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.SPELL)
	}

	onPlaySpell(owner: ServerPlayerInGame): void {
		const opponent = this.game.getOpponent(owner)
		if (opponent.cardHand.isEmpty()) {
			return
		}
		opponent.cardHand.getRandomCard().reveal(opponent, owner)
	}
}
