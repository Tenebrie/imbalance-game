import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'

export default class SpellCardDrawer extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.SPELL)
	}

	onPlaySpell(owner: ServerPlayerInGame): void {
		owner.drawCards(1)
	}
}
