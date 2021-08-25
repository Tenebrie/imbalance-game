import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import ServerUnit from '../../../../models/ServerUnit'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerBoardRow from '../../../../models/ServerBoardRow'
import Keywords from '@src/utils/Keywords'
import CardTribe from '@src/../../shared/src/enums/CardTribe'
import BuffSpellExtraCostThisRound from '@src/game/buffs/BuffSpellExtraCostThisRound'

export default class SpellRustedWagon extends ServerCard {
	moveDistance = 1

	movingUnit: ServerUnit | null = null

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.SALVAGE],
			sortPriority: 2,
			stats: {
				cost: 1,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			moveDistance: this.moveDistance,
		}

		this.createDeployTargets(TargetType.UNIT)
			.label('card.spellRustedWagon.target.label.unit')
			.requireAllied()
			.require(() => this.movingUnit === null)
			.perform(({ targetUnit }) => (this.movingUnit = targetUnit))

		this.createDeployTargets(TargetType.BOARD_POSITION)
			.label('card.spellRustedWagon.target.label.row')
			.requireAllied()
			.require(() => !!this.movingUnit)
			.require(({ targetRow }) => targetRow.index !== this.movingUnit!.rowIndex)
			.require(({ targetRow }) => Math.abs(targetRow.index - this.movingUnit!.rowIndex) <= this.moveDistance)
			.perform(({ targetRow, targetPosition }) => this.onTargetRowSelected(targetRow, targetPosition))
			.finalize(() => (this.movingUnit = null))
			.finalize(() => this.buffs.add(BuffSpellExtraCostThisRound, this))
	}

	private onTargetRowSelected(row: ServerBoardRow, position: number): void {
		const movingUnit = this.movingUnit!
		Keywords.move.unit(movingUnit).toPosition(row, position)
	}
}
