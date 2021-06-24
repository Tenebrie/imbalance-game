import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import ExpansionSet from '@shared/enums/ExpansionSet'
import UnitAfflictedPeasant from '@src/game/cards/02-wild/common/UnitAfflictedPeasant'

export default class UnitAfflictedWerewolf extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.WILD,
			tribes: [CardTribe.BEAST],
			stats: {
				power: 13,
			},
			expansionSet: ExpansionSet.BASE,
			relatedCards: [UnitAfflictedPeasant],
			hiddenFromLibrary: true,
		})
	}
}
