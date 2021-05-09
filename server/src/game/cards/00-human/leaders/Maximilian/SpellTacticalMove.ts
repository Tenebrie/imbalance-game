import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import ServerUnit from '../../../../models/ServerUnit'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asDirectHealingPotency, asDirectSpellDamage } from '../../../../../utils/LeaderStats'
import ServerBoardRow from '../../../../models/ServerBoardRow'
import MoveDirection from '@shared/enums/MoveDirection'
import ServerDamageInstance from '../../../../models/ServerDamageSource'

export default class SpellTacticalMove extends ServerCard {
	damage = asDirectSpellDamage(1)
	healing = asDirectHealingPotency(2)

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
			.requireAllied()
			.require(() => this.movingUnit === null)
			.label('card.spellTacticalMove.target.label.unit')
			.perform(({ targetUnit }) => this.onTargetUnitSelected(targetUnit))

		this.createDeployTargets(TargetType.BOARD_POSITION)
			.requireAllied()
			.require(() => !!this.movingUnit)
			.require(({ targetRow }) => targetRow.index !== this.movingUnit!.rowIndex)
			.require(({ targetRow }) => Math.abs(targetRow.index - this.movingUnit!.rowIndex) <= 1)
			.label('card.spellTacticalMove.target.label.row')
			.perform(({ targetRow, targetPosition }) => this.onTargetRowSelected(targetRow, targetPosition))
			.finalize(() => this.onTargetsConfirmed())
	}

	private onTargetUnitSelected(target: ServerUnit): void {
		this.movingUnit = target
	}

	private onTargetRowSelected(row: ServerBoardRow, position: number): void {
		const rowIndex = row.index
		const movingUnit = this.movingUnit!
		const moveDirection = this.game.board.getMoveDirection(this.ownerInGame, this.game.board.rows[movingUnit.rowIndex], row)
		this.game.board.moveUnit(movingUnit, rowIndex, position)
		if (moveDirection === MoveDirection.FORWARD && this.game.board.getDistanceToDynamicFrontForPlayer(rowIndex, this.ownerInGame) === 0) {
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

	private onTargetsConfirmed(): void {
		this.movingUnit = null
	}
}
