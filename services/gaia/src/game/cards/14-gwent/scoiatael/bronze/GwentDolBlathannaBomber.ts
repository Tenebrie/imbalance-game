import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import GwentIncineratingTrap from './GwentIncineratingTrap'

export default class GwentDolBlathannaBomber extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.ELF],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Dol Blathanna Bomber',
				description: `*Spawn* an *Incinerating Trap* on an enemy row.`,
				flavor: "Take another step, dh'oine. You'd look better with an arrow between your eyes.",
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner }) => {
			Keywords.createCard.for(owner).fromConstructor(GwentIncineratingTrap)
		})
	}
}
