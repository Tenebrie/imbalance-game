import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import BuffGwentRowFrost from '@src/game/buffs/14-gwent/BuffGwentRowFrost'
import ServerBoardRow from '@src/game/models/ServerBoardRow'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentWhiteFrost extends ServerCard {
	private firstRow: ServerBoardRow | null = null

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.HAZARD],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'White Frost',
				description: 'Apply *Biting Frost* to *2* adjacent enemy rows.',
				flavor: 'Behold Tedd Deireadh, the Final Age. The world destroyed by the White Frost.',
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.totalTargetCount(2)
			.requireEnemy()
			.perform(({ targetRow }) => {
				this.firstRow = targetRow
				targetRow.buffs.add(BuffGwentRowFrost, this)
			})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.totalTargetCount(2)
			.requireEnemy()
			.require(({ targetRow }) => !!this.firstRow && Math.abs(targetRow.index - this.firstRow.index) === 1)
			.perform(({ targetRow }) => {
				targetRow.buffs.add(BuffGwentRowFrost, this)
			})

		this.createEffect(GameEventType.CARD_RESOLVED).perform(() => (this.firstRow = null))
	}
}
