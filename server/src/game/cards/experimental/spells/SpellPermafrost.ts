import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerPlayerInGame from '../../../players/ServerPlayerInGame'
import CardColor from '../../../shared/enums/CardColor'
import BuffImmunity from '../../../buffs/BuffImmunity'
import CardLibrary from '../../../libraries/CardLibrary'

export default class SpellPermafrost extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.GOLDEN)
		this.basePower = 6
	}

	onPlayedAsSpell(owner: ServerPlayerInGame): void {
		const alliedUnits = this.game.board.getUnitsOwnedByPlayer(owner)
		alliedUnits.forEach(unit => {
			unit.card.cardBuffs.add(new BuffImmunity(), this, 2)
		})

		owner.cardHand.addSpell(CardLibrary.instantiate(new SpellPermafrost(this.game)))
	}
}
