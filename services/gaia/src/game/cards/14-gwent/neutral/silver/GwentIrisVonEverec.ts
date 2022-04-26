import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { getMultipleRandomArrayValues } from '@src/utils/Utils'

export default class GwentIrisVonEverec extends ServerCard {
	public static readonly BOOST = 5
	public static readonly TARGETS = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.REDANIA, CardTribe.CURSED],
			features: [CardFeature.SPY, CardFeature.HAS_DEATHWISH],
			stats: {
				power: 3,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Iris von Everec`,
				description: `*Deathwish*: Boost *${GwentIrisVonEverec.TARGETS}* random units on the opposite side by *${GwentIrisVonEverec.BOOST}*.`,
				flavor: `I remember so little… Yet when I think of my rose, I begin to recall what was.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DESTROYED).perform(({ rowIndex }) => {
			const oppositeRow = game.board.getOppositeRow(rowIndex)
			const validUnits = oppositeRow.splashableCards
			const targets = getMultipleRandomArrayValues(validUnits, GwentIrisVonEverec.TARGETS)
			targets.forEach((unit) => {
				unit.boostBy(GwentIrisVonEverec.BOOST, this, 'stagger')
			})
		})
	}
}
