import CardType from '@shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'
import CardColor from '@shared/enums/CardColor'
import BuffImmunity from '../../buffs/BuffImmunity'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'

export default class SpellPermafrost extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.GOLDEN, CardFaction.ARCANE)
		this.baseFeatures = [CardFeature.HERO_POWER]
		this.basePower = 6
	}

	onPlayedAsSpell(owner: ServerPlayerInGame): void {
		const alliedUnits = this.game.board.getUnitsOwnedByPlayer(owner)
		alliedUnits.forEach(unit => {
			unit.card.buffs.add(new BuffImmunity(), this, 2)
		})
	}
}
