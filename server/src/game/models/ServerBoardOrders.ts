import ServerGame from './ServerGame'
import ServerUnit from './ServerUnit'
import {ServerCardTargetCard, ServerCardTargetRow, ServerCardTargetUnit} from './ServerCardTarget'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import TargetMode from '@shared/enums/TargetMode'
import GameEventCreators from './events/GameEventCreators'

export default class ServerBoardOrders {
	readonly game: ServerGame
	readonly performedOrders: (ServerCardTargetUnit | ServerCardTargetCard | ServerCardTargetRow)[]

	constructor(game: ServerGame) {
		this.game = game
		this.performedOrders = []
	}

	public performUnitOrder(order: ServerCardTargetUnit | ServerCardTargetCard | ServerCardTargetRow): void {
		if (!this.isOrderValid(order)) {
			return
		}

		this.performedOrders.push(order)

		const sourceCard = order.sourceCard!
		const orderedUnit = sourceCard.unit!
		const previousTargets = this.getOrdersPerformedByUnit(orderedUnit)
		const targetDefinitions = orderedUnit.card.targeting.getUnitOrderTargetDefinitions()
		const isValid = targetDefinitions.every(targetDefinition => {
			return targetDefinition.require(TargetMode.UNIT_ORDER, order.targetType, { ...order, sourceCard: sourceCard, previousTargets })
		})
		if (!isValid) {
			return
		}

		if (order instanceof ServerCardTargetCard || order instanceof ServerCardTargetUnit) {
			this.game.events.postEvent(GameEventCreators.unitOrderedCard({
				triggeringUnit: orderedUnit,
				targetType: order.targetType,
				targetArguments: order
			}))
		} else {
			this.game.events.postEvent(GameEventCreators.unitOrderedRow({
				triggeringUnit: orderedUnit,
				targetType: order.targetType,
				targetArguments: order
			}))
		}

		OutgoingMessageHandlers.notifyAboutValidActionsChanged(this.game, orderedUnit.owner)
	}

	private isOrderValid(order: ServerCardTargetUnit | ServerCardTargetCard | ServerCardTargetRow): boolean {
		return !!order.sourceCard?.unit?.getValidOrders().find(validOrder => order.isEqual(validOrder))
	}

	public getOrdersPerformedByUnit(unit: ServerUnit): (ServerCardTargetUnit | ServerCardTargetCard | ServerCardTargetRow)[] {
		return this.performedOrders.filter(order => order.sourceCard?.unit === unit)
	}

	public clearPerformedOrders(): void {
		while (this.performedOrders.length > 0) {
			this.performedOrders.splice(0, 1)
		}
	}
}
