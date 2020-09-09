import ServerGame from './ServerGame'
import ServerUnit from './ServerUnit'
import ServerBoardRow from './ServerBoardRow'
import runCardEventHandler from '../utils/runCardEventHandler'
import ServerDamageInstance from './ServerDamageSource'
import ServerCardTarget from './ServerCardTarget'
import OutgoingAnimationMessages from '../handlers/outgoing/OutgoingAnimationMessages'
import ServerAnimation from './ServerAnimation'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import Constants from '@shared/Constants'
import GameEventCreators from './GameEventCreators'

export default class ServerBoardOrders {
	readonly game: ServerGame
	readonly performedOrders: ServerCardTarget[]

	constructor(game: ServerGame) {
		this.game = game
		this.performedOrders = []
	}

	public performUnitOrder(order: ServerCardTarget): void {
		if (!this.isOrderValid(order)) {
			return
		}

		this.performedOrders.push(order)

		const orderedUnit = order.sourceCard.unit
		const previousTargets = this.getOrdersPerformedByUnit(orderedUnit)
		const targetDefinitions = orderedUnit.card.targeting.getUnitOrderTargetDefinitions()
		const isValid = targetDefinitions.every(targetDefinition => {
			return targetDefinition.require(TargetMode.UNIT_ORDER, order.targetType, { ...order, previousTargets })
		})
		if (!isValid) {
			return
		}

		this.game.events.postEvent(GameEventCreators.unitOrdered({
			triggeringUnit: orderedUnit,
			targetType: order.targetType,
			targetArguments: order
		}))

		OutgoingMessageHandlers.notifyAboutValidActionsChanged(this.game, orderedUnit.owner)
	}

	private isOrderValid(order: ServerCardTarget): boolean {
		return !!order.sourceCard.unit.getValidOrders().find(validOrder => order.isEqual(validOrder))
	}

	public getOrdersPerformedByUnit(unit: ServerUnit): ServerCardTarget[] {
		return this.performedOrders.filter(order => order.sourceCard.unit === unit)
	}

	public clearPerformedOrders(): void {
		while (this.performedOrders.length > 0) {
			this.performedOrders.splice(0, 1)
		}
	}
}
