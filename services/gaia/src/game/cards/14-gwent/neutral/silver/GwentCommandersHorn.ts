import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentCommandersHorn extends ServerCard {
	public static readonly BOOST = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.TACTIC],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Commander's Horn`,
				description: `Boost *5* adjacent units by *${GwentCommandersHorn.BOOST}*.`,
				flavor: `Plus one to morale, minus one to hearing.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT).perform(({ targetUnit }) => {
			const adjacentUnits = targetUnit.boardRow.splashableCards.filter(
				(unit) => game.board.getHorizontalUnitDistance(unit, targetUnit) <= 2
			)
			adjacentUnits.forEach((unit) => {
				unit.boostBy(GwentCommandersHorn.BOOST, this, 'stagger')
			})
		})
	}
}
