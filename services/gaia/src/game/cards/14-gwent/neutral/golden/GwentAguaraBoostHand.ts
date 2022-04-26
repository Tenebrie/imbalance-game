import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { getRandomArrayValue } from '@src/utils/Utils'

export default class GwentAguaraBoostHand extends ServerCard {
	public static readonly BOOST = 5

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
				name: `Aguara's Encouragement`,
				description: `Boost a random unit in your hand by *${GwentAguaraBoostHand.BOOST}*.`,
				flavor: `Smarten up right now, or it's off to an aguara with you!`,
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => {
			const validUnits = owner.cardHand.allCards.filter((card) => card.type === CardType.UNIT)
			const target = getRandomArrayValue(validUnits)
			if (target === null) {
				return
			}

			target.boostBy(GwentAguaraBoostHand.BOOST, this)
		})
	}
}
