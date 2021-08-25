import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import ServerUnit from '../../../../models/ServerUnit'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asDirectHealingPotency, asDirectSpellDamage } from '@src/utils/LeaderStats'
import ServerBoardRow from '../../../../models/ServerBoardRow'
import MoveDirection from '@shared/enums/MoveDirection'
import ServerDamageInstance from '../../../../models/ServerDamageSource'
import Keywords from '@src/utils/Keywords'

export default class SpellTacticalMove extends ServerCard {
	damage = asDirectSpellDamage(2)
	healing = asDirectHealingPotency(3)

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
			damage: this.damage,
			healing: this.healing,
		}

		this.createDeployTargets(TargetType.UNIT)
			.label('card.spellTacticalMove.target.label.unit')
			.requireAllied()
			.require(() => this.movingUnit === null)
			.perform(({ targetUnit }) => (this.movingUnit = targetUnit))

		this.createDeployTargets(TargetType.BOARD_POSITION)
			.label('card.spellTacticalMove.target.label.row')
			.requireAllied()
			.require(() => !!this.movingUnit)
			.require(({ targetRow }) => targetRow.index !== this.movingUnit!.rowIndex)
			.require(({ targetRow }) => Math.abs(targetRow.index - this.movingUnit!.rowIndex) <= 1)
			.perform(({ targetRow, targetPosition }) => this.onTargetRowSelected(targetRow, targetPosition))
			.finalize(() => (this.movingUnit = null))
	}

	private onTargetRowSelected(row: ServerBoardRow, position: number): void {
		const movingUnit = this.movingUnit!
		const moveDirection = this.game.board.getMoveDirection(this.ownerGroupInGame, this.game.board.rows[movingUnit.rowIndex], row)
		Keywords.move.unit(movingUnit).toPosition(row, position)
		if (moveDirection === MoveDirection.FORWARD && this.game.board.getDistanceToDynamicFrontForPlayer(row, this.ownerGroupInGame) === 0) {
			const targets = this.game.board.getClosestOpposingUnits(movingUnit)
			targets.forEach((target) => {
				this.game.animation.createAnimationThread()
				target.dealDamage(ServerDamageInstance.fromCard(this.damage, movingUnit.card))
				this.game.animation.commitAnimationThread()
			})
		} else if (moveDirection === MoveDirection.BACK) {
			movingUnit.card.heal(ServerDamageInstance.fromCard(this.healing, this))
		}
	}
}
