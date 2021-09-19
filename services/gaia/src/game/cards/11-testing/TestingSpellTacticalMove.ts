import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'

import ServerBoardRow from '../../models/ServerBoardRow'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerUnit from '../../models/ServerUnit'

export default class TestingSpellTacticalMove extends ServerCard {
	movingUnit: ServerUnit | null = null

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.TESTING,
		})

		this.createDeployTargets(TargetType.UNIT).require(() => this.movingUnit === null)

		this.createDeployTargets(TargetType.BOARD_ROW)
			.requireAllied()
			.require(() => !!this.movingUnit)
			.require(({ targetRow }) => targetRow.index !== this.movingUnit!.rowIndex)

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
