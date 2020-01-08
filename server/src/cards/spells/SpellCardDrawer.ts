import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/game/ServerCard'
import ServerGame from '../../libraries/game/ServerGame'
import ServerPlayerInGame from '../../libraries/players/ServerPlayerInGame'

export default class SpellCardDrawer extends ServerCard {
	constructor() {
		super(CardType.SPELL, 'spellCardDrawer')
	}

	onPlaySpell(game: ServerGame, owner: ServerPlayerInGame): void {
		owner.drawCards(game, 1)
	}
}
