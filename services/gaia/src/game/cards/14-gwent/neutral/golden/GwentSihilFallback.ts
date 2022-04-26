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

export default class GwentSihilFallback extends ServerCard {
	public static readonly DAMAGE = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.DOOMED],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: `Sihil's Nope`,
				description: `Play a random Bronze or Silver unit from your deck.`,
				flavor: `What's written on this blade? That a curse? No. An insult.`,
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => {
			const validCards = owner.cardDeck.allCards.filter((card) => card.type === CardType.UNIT && card.isBronzeOrSilver)
			const targetCard = getRandomArrayValue(validCards)
			if (!targetCard) {
				return
			}
			Keywords.playCardFromDeck(targetCard)
		})
	}
}
