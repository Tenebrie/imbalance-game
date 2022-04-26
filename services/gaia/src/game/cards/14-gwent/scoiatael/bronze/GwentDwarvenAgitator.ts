import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BotCardEvaluation from '@src/game/AI/BotCardEvaluation'
import Keywords from '@src/utils/Keywords'
import { getRandomArrayValue } from '@src/utils/Utils'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentDwarvenAgitator extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SUPPORT, CardTribe.DWARF],
			stats: {
				power: 2,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Dwarven Agitator',
				description: '*Spawn* a default copy of a random different Bronze Dwarf from your deck.',
				flavor: "Mark me words, if ye dinnae get up off yer arses, humans're gonnae come here an' steal our wenches!",
			},
		})

		this.createPlayTargets().evaluate(({ targetRow }) => (targetRow.hasBoon ? 1 : 0))

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner }) => {
			const validCards = owner.cardDeck.allCards.filter(
				(card) => card.tribes.includes(CardTribe.DWARF) && card.color === CardColor.BRONZE && card.class !== this.class
			)
			const cardToPlay = getRandomArrayValue(validCards)
			if (!cardToPlay) {
				return
			}
			Keywords.createCard.for(owner).fromInstance(cardToPlay)
		})

		this.botEvaluation = new CustomBotEvaluation(this)
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get expectedValue(): number {
		return 94
	}
}
