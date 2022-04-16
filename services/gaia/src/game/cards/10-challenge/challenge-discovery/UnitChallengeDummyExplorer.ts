import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { getRandomArrayValue } from '@src/utils/Utils'

import Keywords from '../../../../utils/Keywords'
import CardLibrary from '../../../libraries/CardLibrary'

export default class UnitChallengeDummyExplorer extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: 'Dummy Explorer',
				description: '*Deploy:*\n*Create* two copies of a random card.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			const validCards = CardLibrary.cards.filter((card) => card.isCollectible && card.color !== CardColor.LEADER).slice()
			const targetCard = getRandomArrayValue(validCards)
			Keywords.createCard.forOwnerOf(this).fromInstance(targetCard)
			Keywords.createCard.forOwnerOf(this).fromInstance(targetCard)
		})
	}
}
