import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'
import ServerPlayerInGame from '../../libraries/players/ServerPlayerInGame'

export default class SpellCardDrawer extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.SPELL, 'spellCardDrawer')
	}

	onPlaySpell(owner: ServerPlayerInGame): void {
		owner.drawCards(1)
	}
}
