import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import ServerUnit from '../../../../models/ServerUnit'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import {asDirectHealingPotency, asDirectSpellDamage} from '../../../../../utils/LeaderStats'
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
				cost: 2
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damage: this.damage,
			healing: this.healing
		}

		this.createDeployEffectTargets()
			.target(TargetType.UNIT)
			.requireAlliedUnit()
			.require(TargetType.UNIT, () => this.movingUnit === null)
			.label(TargetType.UNIT, 'card.spellTacticalMove.target.label.unit')

		this.createDeployEffectTargets()
			.target(TargetType.BOARD_ROW)
			.requirePlayersRow()
			.require(TargetType.BOARD_ROW, () => !!this.movingUnit)
			.require(TargetType.BOARD_ROW, ({ targetRow }) => targetRow.index !== this.movingUnit!.rowIndex)
			.require(TargetType.BOARD_ROW, ({ targetRow }) => Math.abs(targetRow.index - this.movingUnit!.rowIndex) <= 1)
			.label(TargetType.BOARD_ROW, 'card.spellTacticalMove.target.label.row')

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT)
			.perform(({ targetUnit }) => this.onTargetUnitSelected(targetUnit))

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_ROW)
			.perform(({ targetRow }) => this.onTargetRowSelected(targetRow))

		this.createEffect(GameEventType.CARD_TARGETS_CONFIRMED)
			.perform(() => this.onTargetsConfirmed())
	}

	private onTargetUnitSelected(target: ServerUnit): void {
		this.movingUnit = target
	}

	private onTargetRowSelected(target: ServerBoardRow): void {
		const movingUnit = this.movingUnit!
		const moveDirection = this.game.board.getMoveDirection(this.ownerInGame, this.game.board.rows[movingUnit.rowIndex], target)
		this.game.board.moveUnitToFarRight(movingUnit, target.index)
		if (moveDirection === MoveDirection.FORWARD && this.game.board.getDistanceToDynamicFrontForPlayer(target.index, this.ownerInGame) === 0) {
			const targets = this.game.board.getClosestOpposingUnits(movingUnit)
			targets.forEach(target => {
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
