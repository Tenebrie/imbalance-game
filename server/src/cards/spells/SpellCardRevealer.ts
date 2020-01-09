import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'
import ServerPlayerInGame from '../../libraries/players/ServerPlayerInGame'

export default class SpellCardRevealer extends ServerCard {
	constructor() {
		super(CardType.SPELL, 'spellCardRevealer')
	}

	onPlaySpell(game: ServerGame, owner: ServerPlayerInGame): void {
		const opponent = game.getOpponent(owner)
		if (opponent.cardHand.isEmpty()) {
			return
		}
		opponent.cardHand.getRandomCard().reveal(game, opponent, owner)
	}
}
