import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'

import Keywords from '../../../../utils/Keywords'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import UnitVoidPortal from '../tokens/UnitVoidPortal'

export default class UnitVoidcaller extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			relatedCards: [UnitVoidPortal],
			stats: {
				power: 11,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			Keywords.createCard.forOwnerOf(this).fromConstructor(UnitVoidPortal)
		})
	}
}
