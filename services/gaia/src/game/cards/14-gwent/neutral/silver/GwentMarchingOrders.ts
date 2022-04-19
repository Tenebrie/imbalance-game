import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getLowestCard } from '@src/utils/Utils'

export default class GwentMarchingOrders extends ServerCard {
	public static readonly BOOST = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			tribes: [CardTribe.TACTIC],
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Marching Orders',
				description: `Boost the *Lowest* Bronze or Silver unit in your deck by *${GwentMarchingOrders.BOOST}*, then play it.`,
				flavor: 'We are but pawns in a game played by old men, sent to fight and die on their senile whims…',
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => {
			const validCards = owner.cardDeck.allCards
				.filter((card) => card.type === CardType.UNIT)
				.filter((card) => card.color === CardColor.BRONZE || card.color === CardColor.SILVER)

			const target = getLowestCard(validCards)
			if (!target) {
				return
			}
			target.boost(GwentMarchingOrders.BOOST, this)
			Keywords.playCardFromDeck(target)
		})
	}
}
