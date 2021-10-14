import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffSpellExtraCostThisRound from '@src/game/buffs/BuffSpellExtraCostThisRound'
import Keywords from '@src/utils/Keywords'

import ServerBoardRow from '../../../../models/ServerBoardRow'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import ServerUnit from '../../../../models/ServerUnit'

export default class SpellRustedWagon extends ServerCard {
	moveDistance = 3

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
		Keywords.moveUnit(movingUnit, row, position)
	}
}
