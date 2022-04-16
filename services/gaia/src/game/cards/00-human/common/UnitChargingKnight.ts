import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import MoveDirection from '@shared/enums/MoveDirection'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { asRecurringUnitDamage } from '@src/utils/LeaderStats'

import { DamageInstance } from '../../../models/ServerDamageSource'

export default class UnitChargingKnight extends ServerCard {
	damage = asRecurringUnitDamage(5)
	movesForwardThisTurn = 0
	maximumMovesThisTurn = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.BEAST],
			stats: {
				power: 16,
				armor: 4,
			},
			expansionSet: ExpansionSet.BASE,
			isExperimental: true,
		})
		this.dynamicTextVariables = {
			damage: this.damage,
		}

		this.createOrderTargets(TargetType.UNIT)
			.targetCount(() => this.movesForwardThisTurn)
			.requireEnemy()
			.perform(({ targetCard }) => {
				targetCard.dealDamage(DamageInstance.fromCard(this.damage, this))
			})

		this.createCallback(GameEventType.UNIT_MOVED, [CardLocation.BOARD])
			.require(({ direction }) => direction === MoveDirection.FORWARD)
			.require(({ triggeringUnit }) => triggeringUnit === this.unit)
			.perform(() => this.onUnitMove())

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.perform(() => this.onTurnEnded())
	}

	private onUnitMove(): void {
		this.movesForwardThisTurn = Math.min(this.maximumMovesThisTurn, this.movesForwardThisTurn + 1)
	}

	private onTurnEnded(): void {
		this.movesForwardThisTurn = 0
	}
}
