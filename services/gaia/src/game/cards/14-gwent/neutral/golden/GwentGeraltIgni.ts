import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getAllHighestUnits } from '@src/utils/Utils'

export default class GwentGeraltIgni extends ServerCard {
	public static readonly MIN_POWER = 25

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.WITCHER],
			stats: {
				power: 5,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Geralt: Igni`,
				description: `Destroy the *Highest* units on an enemy row if that row has a total of *${GwentGeraltIgni.MIN_POWER}* or more.`,
				flavor: `A twist of a witcher's fingers can light a lamp… or incinerate a foe.`,
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.requireEnemy()
			.require(({ targetRow }) => game.board.getTotalRowPower(targetRow) >= GwentGeraltIgni.MIN_POWER)
			.perform(({ targetRow }) => {
				const enemyUnits = targetRow.splashableCards
				const highestEnemyUnits = getAllHighestUnits(enemyUnits)
				highestEnemyUnits.forEach((unit) => {
					Keywords.destroyUnit({
						unit,
						source: this,
						threadType: 'stagger',
					})
				})
			})
	}
}
