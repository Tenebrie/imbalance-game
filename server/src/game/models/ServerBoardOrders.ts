import ServerGame from './ServerGame'
import ServerUnit from './ServerUnit'
import GameEventCreators from './events/GameEventCreators'
import TargetType from '@shared/enums/TargetType'
import { ValidServerCardTarget } from '@src/game/models/ServerCardTargeting'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import OrderTargetDefinition from '@src/game/models/targetDefinitions/OrderTargetDefinition'
import {
	CardTargetValidatorArguments,
	PositionTargetValidatorArguments,
	RowTargetValidatorArguments,
	UnitTargetValidatorArguments,
} from '@src/types/TargetValidatorArguments'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'

export type OrderTarget = {
	target: ValidServerCardTarget
	definition: OrderTargetDefinition<any>
}

export default class ServerBoardOrders {
	readonly game: ServerGame
	readonly performedOrders: OrderTarget[]

	constructor(game: ServerGame) {
		this.game = game
		this.performedOrders = []
	}

	public get validOrders(): OrderTarget[] {
		return this.game.board
			.getAllUnits()
			.map((unit) => unit.getValidOrders())
			.flat()
	}

	public performUnitOrderFromMessage(targetMessage: CardTargetMessage, player: ServerPlayerInGame): void {
		const order = this.validOrders.find((validOrder) => validOrder.target.id === targetMessage.id)
		if (!order) {
			return
		}
		this.performUnitOrder(order, player)
	}

	public performUnitOrder(order: OrderTarget, player: ServerPlayerInGame): void {
		const sourceCard = order.target.sourceCard!
		const orderedUnit = sourceCard.unit!

		if (order.target.targetType === TargetType.UNIT) {
			const definition = order.definition as OrderTargetDefinition<UnitTargetValidatorArguments>
			const applicablePreviousOrders = this.performedOrders.filter((order) => order.definition === definition)
			definition.perform({
				player,
				sourceCard: sourceCard,
				targetCard: order.target.targetCard,
				targetUnit: order.target.targetCard.unit!,
				previousTargets: applicablePreviousOrders.map((previousOrder) => previousOrder.target),
			})
		} else if (order.target.targetType === TargetType.BOARD_ROW) {
			const definition = order.definition as OrderTargetDefinition<RowTargetValidatorArguments>
			const applicablePreviousOrders = this.performedOrders.filter((order) => order.definition === definition)
			definition.perform({
				player,
				sourceCard: sourceCard,
				targetRow: order.target.targetRow,
				previousTargets: applicablePreviousOrders.map((previousOrder) => previousOrder.target),
			})
		} else if (order.target.targetType === TargetType.BOARD_POSITION) {
			const definition = order.definition as OrderTargetDefinition<PositionTargetValidatorArguments>
			const applicablePreviousOrders = this.performedOrders.filter((order) => order.definition === definition)
			definition.perform({
				player,
				sourceCard: sourceCard,
				targetRow: order.target.targetRow,
				targetPosition: order.target.targetPosition,
				previousTargets: applicablePreviousOrders.map((previousOrder) => previousOrder.target),
			})
		} else {
			const definition = order.definition as OrderTargetDefinition<CardTargetValidatorArguments>
			const applicablePreviousOrders = this.performedOrders.filter((order) => order.definition === definition)
			definition.perform({
				player,
				sourceCard: sourceCard,
				targetCard: order.target.targetCard,
				previousTargets: applicablePreviousOrders.map((previousOrder) => previousOrder.target),
			})
		}

		if (order.target.targetType !== TargetType.BOARD_ROW && order.target.targetType !== TargetType.BOARD_POSITION) {
			this.game.events.postEvent(
				GameEventCreators.unitIssuedOrderTargetingCard({
					game: this.game,
					triggeringUnit: orderedUnit,
					targetType: order.target.targetType,
					targetCard: order.target.targetCard,
					targetArguments: order.target,
				})
			)
		}
		if (order.target.targetType === TargetType.UNIT) {
			this.game.events.postEvent(
				GameEventCreators.unitIssuedOrderTargetingUnit({
					game: this.game,
					triggeringUnit: orderedUnit,
					targetType: order.target.targetType,
					targetCard: order.target.targetCard,
					targetUnit: order.target.targetCard.unit!,
					targetArguments: order.target,
				})
			)
		}
		if (order.target.targetType === TargetType.BOARD_ROW) {
			this.game.events.postEvent(
				GameEventCreators.unitIssuedOrderTargetingRow({
					game: this.game,
					triggeringUnit: orderedUnit,
					targetType: order.target.targetType,
					targetRow: order.target.targetRow,
					targetArguments: order.target,
				})
			)
		}
		if (order.target.targetType === TargetType.BOARD_POSITION) {
			this.game.events.postEvent(
				GameEventCreators.unitIssuedOrderTargetingPosition({
					game: this.game,
					triggeringUnit: orderedUnit,
					targetType: order.target.targetType,
					targetRow: order.target.targetRow,
					targetPosition: order.target.targetPosition,
					targetArguments: order.target,
				})
			)
		}

		this.performedOrders.push(order)
	}

	public getOrdersPerformedByUnit(unit: ServerUnit): OrderTarget[] {
		return this.performedOrders.filter((order) => order.target.sourceCard?.unit === unit)
	}

	public clearPerformedOrders(): void {
		while (this.performedOrders.length > 0) {
			this.performedOrders.splice(0, 1)
		}
	}
}
