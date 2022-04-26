import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentDudaCompanion extends ServerCard {
	public static readonly BOOST = 2
	public static readonly DISTANCE = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.BEAST, CardTribe.DOOMED],
			stats: {
				power: 1,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: `Duda: Companion`,
				description: `Boost *${GwentDudaCompanion.DISTANCE}* units on each side of this unit by *${GwentDudaCompanion.BOOST}*.`,
				flavor: `Knows one hundred words - eighty of them curses, the rest, connectors.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit }) => {
			const targets = triggeringUnit.boardRow.splashableCards
				.filter((unit) => unit !== triggeringUnit)
				.filter((unit) => game.board.getHorizontalUnitDistance(triggeringUnit, unit) <= GwentDudaCompanion.DISTANCE)

			targets.forEach((unit) => {
				unit.boostBy(GwentDudaCompanion.BOOST, this, 'stagger')
			})
		})
	}
}
