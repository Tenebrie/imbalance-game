import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import BuffPermanentImmunity from '@src/game/buffs/BuffPermanentImmunity'
import BuffPermanentNightwatch from '@src/game/buffs/BuffPermanentNightwatch'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class UnitShatteredSpace extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			stats: {
				power: 0,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
		this.buffs.add(BuffPermanentImmunity, this)
		this.buffs.add(BuffPermanentNightwatch, this)
	}
}
