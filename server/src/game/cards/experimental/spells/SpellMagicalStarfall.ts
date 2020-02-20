import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'

export default class SpellMagicalStarfall extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.SPELL)
		this.basePower = 4
	}

	onPlaySpell(owner: ServerPlayerInGame): void {
		const alliedUnits = this.game.board.getAllUnits().filter(unit => unit.owner === owner)
		alliedUnits.forEach(unit => {
			unit.setPower(unit.card.power + 3)
			unit.setAttack(unit.card.attack + 2)
		})
	}
}
