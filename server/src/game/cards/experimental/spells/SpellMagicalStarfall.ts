import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'

export default class SpellMagicalStarfall extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.BRONZE, CardFaction.EXPERIMENTAL)
		this.basePower = 4
	}

	onPlayedAsSpell(owner: ServerPlayerInGame): void {
		const alliedUnits = this.game.board.getAllUnits().filter(unit => unit.owner === owner)
		alliedUnits.forEach(unit => {
			unit.setPower(unit.card.power + 3)
		})
	}
}
