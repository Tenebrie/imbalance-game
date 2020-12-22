import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '../../models/ServerCard'
import ServerUnit from '../../models/ServerUnit'
import ServerGame from '../../models/ServerGame'
import ServerBoardRow from '../../models/ServerBoardRow'

export default class TestingSpellTacticalMove extends ServerCard {
	movingUnit: ServerUnit | null = null

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.TOKEN,
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployEffectTargets()
			.target(TargetType.UNIT)
			.require(TargetType.UNIT, () => this.movingUnit === null)

		this.createDeployEffectTargets()
			.target(TargetType.BOARD_ROW)
			.requirePlayersRow()
			.require(TargetType.BOARD_ROW, () => !!this.movingUnit)
			.require(TargetType.BOARD_ROW, ({ targetRow }) => targetRow.index !== this.movingUnit!.rowIndex)

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT).perform(({ targetUnit }) => this.onTargetUnitSelected(targetUnit))

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_ROW).perform(({ targetRow }) => this.onTargetRowSelected(targetRow))
	}

	private onTargetUnitSelected(target: ServerUnit): void {
		this.movingUnit = target
	}

	private onTargetRowSelected(target: ServerBoardRow): void {
		const movingUnit = this.movingUnit!
		this.game.board.moveUnitToFarRight(movingUnit, target.index)
	}
}
