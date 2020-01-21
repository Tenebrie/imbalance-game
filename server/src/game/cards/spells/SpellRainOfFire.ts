import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'
import ServerDamageInstance from '../../models/ServerDamageSource'

export default class SpellRainOfFire extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.SPELL)
	}

	onPlaySpell(owner: ServerPlayerInGame): void {
		const opposingUnits = this.game.board.getAllUnits().filter(unit => unit.owner !== owner)
		opposingUnits.forEach(unit => {
			unit.dealDamage(ServerDamageInstance.fromSpell(5, this))
		})
		owner.drawCards(1)
	}
}
