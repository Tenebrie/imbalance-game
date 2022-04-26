import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { shuffle } from '@shared/Utils'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentVriheddNeophyte extends ServerCard {
	public static readonly UNIT_COUNT = 2
	public static readonly BOOST = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.ELF],
			stats: {
				power: 10,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Vrihedd Neophyte`,
				description: `Boost *${GwentVriheddNeophyte.UNIT_COUNT}* random units in your hand by *${GwentVriheddNeophyte.BOOST}*.`,
				flavor: `Many nonhumans, fed up with the racism and xenophobia they encounter in the cities, decide to join the Scoia'tael.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner }) => {
			const units = owner.cardHand.allCards.filter((card) => card.type === CardType.UNIT)

			if (units.length === 0) {
				return
			}

			shuffle(units)
				.slice(0, GwentVriheddNeophyte.UNIT_COUNT)
				.forEach((unit) => unit.boostBy(GwentVriheddNeophyte.BOOST, this))
		})
	}
}
