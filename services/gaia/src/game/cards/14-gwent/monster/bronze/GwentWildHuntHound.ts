import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { shuffle } from '@shared/Utils'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import GwentBitingFrost from '../../neutral/bronze/GwentBitingFrost'

export default class GwentWildHuntHound extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.WILD_HUNT, CardTribe.CONSTRUCT],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Wild Hunt Hound',
				description: 'Play *Biting Frost* from your deck.',
				flavor: "Cry 'Havoc!', and let slip the dogs of war.",
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner }) => {
			const validCards = owner.cardDeck.allCards.filter((card) => card instanceof GwentBitingFrost)

			if (validCards.length === 0) {
				return
			}
			const cardToPlay = shuffle(validCards)[0]
			Keywords.playCardFromDeckOrGraveyard(cardToPlay)
		})
	}
}
