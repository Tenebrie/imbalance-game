import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getRandomArrayValue } from '@src/utils/Utils'

export default class GwentCantripSkies extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.TACTIC, CardTribe.TOKEN, CardTribe.DOOMED],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: 'Cantrip Skies',
				description: 'Play a random Bronze unit from your deck.',
				flavor: "Maybe the light wasn't that important after all...",
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => {
			const validCards = owner.cardDeck.allCards.filter((card) => card.type === CardType.UNIT && card.color === CardColor.BRONZE)
			const targetCard = getRandomArrayValue(validCards)
			if (!targetCard) {
				return
			}
			Keywords.playCardFromDeck(targetCard)
		})
	}
}
