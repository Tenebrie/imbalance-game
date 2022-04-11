import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { shuffle } from '@shared/Utils'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import GwentMoonlight from './GwentMoonlight'

export default class GwentSiren extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.BEAST],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Siren',
				description: 'Play *Moonlight* from your deck.',
				flavor:
					'Legends claim they lure sailors to their doom with their entrancing songs… though more likely, the sailors were more entranced by their other ample charms.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner }) => {
			const validCards = owner.cardDeck.allCards.filter((card) => card instanceof GwentMoonlight)
			if (validCards.length === 0) {
				return
			}
			const cardToPlay = shuffle(validCards)[0]
			Keywords.playCardFromDeck(cardToPlay)
		})
	}
}
