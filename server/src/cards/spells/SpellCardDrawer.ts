import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'
import ServerPlayerInGame from '../../libraries/players/ServerPlayerInGame'

export default class SpellCardDrawer extends ServerCard {
	constructor() {
		super('spellCardDrawer')
	}

	onPlay(game: ServerGame, playerInGame: ServerPlayerInGame): void {
		playerInGame.drawCards(game, 1)
	}
}
