import ServerGame from './ServerGame'
import ServerUnit from './ServerUnit'
import { ServerCardTargetCard, ServerCardTargetRow, ServerCardTargetUnit } from './ServerCardTarget'
import TargetMode from '@shared/enums/TargetMode'
import GameEventCreators from './events/GameEventCreators'
import TargetType from '@shared/enums/TargetType'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'

export default class ServerBoardOrders {
	readonly game: ServerGame
	readonly performedOrders: (ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow)[]

	constructor(game: ServerGame) {
		this.game = game
		this.performedOrders = []
	}

	public performUnitOrder(order: ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow): void {
		if (!this.isOrderValid(order)) {
			return
		}

		this.performedOrders.push(order)

		const sourceCard = order.sourceCard!
		const orderedUnit = sourceCard.unit!
		const previousTargets = this.getOrdersPerformedByUnit(orderedUnit)
		const targetDefinitions = orderedUnit.card.targeting.getUnitOrderTargetDefinitions()
		const isValid = targetDefinitions.every((targetDefinition) => {
			return targetDefinition.require(TargetMode.UNIT_ORDER, order.targetType, { ...order, sourceCard: sourceCard, previousTargets })
		})
		if (!isValid) {
			return
		}

		if (order.targetType !== TargetType.BOARD_ROW) {
			this.game.events.postEvent(
				GameEventCreators.unitIssuedOrderTargetingCard({
					triggeringUnit: orderedUnit,
					targetType: order.targetType,
					targetCard: order.targetCard,
					targetArguments: order,
				})
			)
		}
		if (order.targetType === TargetType.UNIT) {
			this.game.events.postEvent(
				GameEventCreators.unitIssuedOrderTargetingUnit({
					triggeringUnit: orderedUnit,
					targetType: order.targetType,
					targetCard: order.targetCard,
					targetUnit: order.targetCard.unit!,
					targetArguments: order,
				})
			)
		}
		if (order.targetType === TargetType.BOARD_ROW) {
			this.game.events.postEvent(
				GameEventCreators.unitIssuedOrderTargetingRow({
					triggeringUnit: orderedUnit,
					targetType: order.targetType,
					targetRow: order.targetRow,
					targetArguments: order,
				})
			)
		}

		OutgoingMessageHandlers.notifyAboutValidActionsChanged(this.game, orderedUnit.owner)
	}

	private isOrderValid(order: ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow): boolean {
		return !!order.sourceCard?.unit?.getValidOrders().find((validOrder) => order.isEqual(validOrder))
	}

	public getOrdersPerformedByUnit(unit: ServerUnit): (ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow)[] {
		return this.performedOrders.filter((order) => order.sourceCard?.unit === unit)
	}

	public clearPerformedOrders(): void {
		while (this.performedOrders.length > 0) {
			this.performedOrders.splice(0, 1)
		}
	}
}
