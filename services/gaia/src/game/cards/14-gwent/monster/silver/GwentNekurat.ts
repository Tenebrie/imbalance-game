import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import GwentMoonlight from '../GwentMoonlight'

export default class GwentNekurat extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.VAMPIRE],
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Nekurat',
				description: '*Spawn* *Moonlight*.',
				flavor: 'Drinking the blood of the Continent since the Conjunction.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			Keywords.createCard.forOwnerOf(this).fromConstructor(GwentMoonlight)
		})
	}
}
