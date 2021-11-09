import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import Keywords from '@src/utils/Keywords'
import { asDirectHealingPotency } from '@src/utils/LeaderStats'

import ServerBoardRow from '../../../../models/ServerBoardRow'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import ServerUnit from '../../../../models/ServerUnit'

export default class SpellTacticalRetreat extends ServerCard {
	public static readonly BASE_HEALING = 3
	healing = asDirectHealingPotency(SpellTacticalRetreat.BASE_HEALING)

	movingUnit: ServerUnit | null = null

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.HUMAN,
			features: [CardFeature.HERO_POWER],
			stats: {
				cost: 2,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			healing: this.healing,
		}

		this.createLocalization({
			en: {
				name: 'Tactical Retreat',
				description: '*Move* an allied unit and *Heal* {healing}.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.label('label.chooseUnit')
			.requireAllied()
			.require(() => this.movingUnit === null)
			.perform(({ targetUnit }) => (this.movingUnit = targetUnit))

		this.createDeployTargets(TargetType.BOARD_POSITION)
			.label('label.moveHere')
			.requireAllied()
			.require(() => !!this.movingUnit)
			.require(({ targetRow, targetPosition }) => !game.board.isPositionAdjacentToUnit(this.movingUnit!, targetRow.index, targetPosition))
			.perform(({ targetRow, targetPosition }) => this.onTargetRowSelected(targetRow, targetPosition))
			.finalize(() => (this.movingUnit = null))
	}

	private onTargetRowSelected(row: ServerBoardRow, position: number): void {
		const movingUnit = this.movingUnit!
		Keywords.moveUnit(movingUnit, row, position)
		movingUnit.card.heal(DamageInstance.fromCard(this.healing, this))
	}
}
