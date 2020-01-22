import ServerGame from './ServerGame'
import ServerCardOnBoard from './ServerCardOnBoard'
import ServerGameBoardRow from './ServerGameBoardRow'
import runCardEventHandler from '../utils/runCardEventHandler'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerDamageInstance from './ServerDamageSource'
import ServerUnitOrder from './ServerUnitOrder'
import UnitOrderType from '../shared/enums/UnitOrderType'
import VoidPlayerInGame from '../utils/VoidPlayerInGame'
import Ruleset from '../Ruleset'

export default class ServerGameBoardOrders {
	game: ServerGame
	queue: ServerUnitOrder[]

	constructor(game: ServerGame) {
		this.game = game
		this.queue = []
	}

	public addUnitOrder(order: ServerUnitOrder): void {
		/* Checking if the exact same order is already given */
		const isOrderClear = this.queue.find(queuedOrder => queuedOrder.isEqual(order))
		this.queue = this.queue.filter(queuedOrder => !queuedOrder.isEqual(order))
		if (isOrderClear) {
			OutgoingMessageHandlers.sendUnitOrders(order.orderedUnit.owner.player, this.queue)
			return
		}

		order.orderedUnit.card.onBeforeUnitOrderIssued(order.orderedUnit, order)
		if (order.orderedUnit.card.isUnitOrderValid(order.orderedUnit, order)) {
			this.addUnitOrderDirectly(order)
			this.queue = this.limitDifferentTypeOrders(this.queue, order)
			this.queue = this.limitSameTypeOrdersToMaxCount(this.queue, order)
			this.queue = this.limitAnyTypeOrdersToMaxCount(this.queue, order)
		}
		order.orderedUnit.card.onAfterUnitOrderIssued(order.orderedUnit, order)
		OutgoingMessageHandlers.sendUnitOrders(order.orderedUnit.owner.player, this.queue)
	}

	public addUnitOrderDirectly(order: ServerUnitOrder): void {
		this.queue.push(order)
	}

	public clearUnitOrders(unit: ServerCardOnBoard): void {
		this.queue = this.queue.filter(queuedOrder => queuedOrder.orderedUnit !== unit)
	}

	private limitDifferentTypeOrders(originalQueue: ServerUnitOrder[], order: ServerUnitOrder): ServerUnitOrder[] {
		let queue = originalQueue.slice()
		const otherOrders = queue.filter(queuedOrder => queuedOrder.orderedUnit === order.orderedUnit)

		otherOrders.forEach(otherOrder => {
			const orderedUnit = order.orderedUnit
			if (order.type !== otherOrder.type && !orderedUnit.card.canPerformOrdersSimultaneously(orderedUnit, order.type, otherOrder.type) && !orderedUnit.card.canPerformOrdersSimultaneously(orderedUnit, otherOrder.type, order.type)) {
				queue = queue.filter(queuedOrder => queuedOrder !== otherOrder)
			}
		})
		return queue
	}

	private limitSameTypeOrdersToMaxCount(originalQueue: ServerUnitOrder[], order: ServerUnitOrder): ServerUnitOrder[] {
		let queue = originalQueue.slice()

		let ordersOfType = queue.filter(queuedOrder => queuedOrder.orderedUnit === order.orderedUnit && queuedOrder.type === order.type)
		const maxOrdersOfType = order.orderedUnit.card.getMaxOrdersOfType(order.orderedUnit, order.type)

		while (ordersOfType.length > maxOrdersOfType) {
			queue = queue.filter(queuedOrder => queuedOrder !== ordersOfType[0])
			ordersOfType = queue.filter(queuedOrder => queuedOrder.orderedUnit === order.orderedUnit && queuedOrder.type === order.type)
		}
		return queue
	}

	private limitAnyTypeOrdersToMaxCount(originalQueue: ServerUnitOrder[], order: ServerUnitOrder): ServerUnitOrder[] {
		let queue = originalQueue.slice()

		let ordersTotal = queue.filter(queuedOrder => queuedOrder.orderedUnit === order.orderedUnit)
		const maxOrdersTotal = order.orderedUnit.card.getMaxOrdersTotal(order.orderedUnit, order.type)

		while (ordersTotal.length > maxOrdersTotal) {
			queue = queue.filter(queuedOrder => queuedOrder !== ordersTotal[0])
			ordersTotal = queue.filter(queuedOrder => queuedOrder.orderedUnit === order.orderedUnit)
		}
		return queue
	}

	public release(): void {
		/* ATTACKS */
		let queuedAttacks = this.queue.filter(order => order.type === UnitOrderType.ATTACK)

		/* Before attacks */
		queuedAttacks.forEach(queuedAttack => {
			runCardEventHandler(() => queuedAttack.orderedUnit.card.onBeforePerformingAttack(queuedAttack.orderedUnit, queuedAttack.targetUnit))
			runCardEventHandler(() => queuedAttack.orderedUnit.card.onBeforeBeingAttacked(queuedAttack.targetUnit, queuedAttack.orderedUnit))
		})
		queuedAttacks = queuedAttacks.filter(order => order.orderedUnit.card.power > 0)

		/* Attacks */
		queuedAttacks.forEach(queuedAttack => {
			this.performUnitAttack(queuedAttack.orderedUnit, queuedAttack.targetUnit)
		})

		/* Destroy killed units */
		const killedUnits = this.game.board.getAllUnits().filter(unit => unit.card.power <= 0)
		killedUnits.forEach(destroyedUnit => {
			destroyedUnit.destroy()
		})

		/* After attacks */
		const survivingAttackers = queuedAttacks.filter(attack => attack.orderedUnit.card.power > 0)
		const survivingTargets = queuedAttacks.filter(attack => attack.targetUnit.card.power > 0)
		survivingAttackers.forEach(attackOrder => {
			runCardEventHandler(() => attackOrder.orderedUnit.card.onAfterPerformingAttack(attackOrder.orderedUnit, attackOrder.targetUnit))
		})
		survivingTargets.forEach(attackOrder => {
			runCardEventHandler(() => attackOrder.targetUnit.card.onAfterBeingAttacked(attackOrder.targetUnit, attackOrder.orderedUnit))
		})

		/* MOVES */
		let queuedMoves = this.queue.filter(order => order.orderedUnit.card.power > 0).filter(order => order.type === UnitOrderType.MOVE)

		/* Before moves */
		queuedMoves.forEach(queuedMove => {
			runCardEventHandler(() => queuedMove.orderedUnit.card.onBeforePerformingMove(queuedMove.orderedUnit, queuedMove.targetRow))
		})
		queuedMoves = queuedMoves.filter(order => order.orderedUnit.card.power > 0)

		/* Contested rows */
		const playerOne = this.game.players[0]
		const playerTwo = this.game.players[1] || VoidPlayerInGame.for(this.game)
		const playerOneMoves = queuedMoves.filter(queuedMove => queuedMove.orderedUnit.owner === playerOne)
		const playerTwoMoves = queuedMoves.filter(queuedMove => queuedMove.orderedUnit.owner === playerTwo)
		const playerOneTargetRows = playerOneMoves.map(queuedMove => queuedMove.targetRow)
		const playerTwoTargetRows = playerTwoMoves.map(queuedMove => queuedMove.targetRow)
		const contestedRows = playerOneTargetRows.filter(row => playerTwoTargetRows.includes(row))
		contestedRows.forEach(contestedRow => {
			const playerOnePower = playerOneMoves.filter(queuedMove => queuedMove.targetRow === contestedRow).map(move => move.orderedUnit.card.power).reduce((total, value) => total + value)
			const playerTwoPower = playerTwoMoves.filter(queuedMove => queuedMove.targetRow === contestedRow).map(move => move.orderedUnit.card.power).reduce((total, value) => total + value)
			if (playerOnePower >= playerTwoPower) {
				queuedMoves = queuedMoves.filter(queuedMove => queuedMove.orderedUnit.owner !== playerTwo || queuedMove.targetRow !== contestedRow)
			}
			if (playerTwoPower >= playerOnePower) {
				queuedMoves = queuedMoves.filter(queuedMove => queuedMove.orderedUnit.owner !== playerOne || queuedMove.targetRow !== contestedRow)
			}
		})
		queuedMoves.sort((a: ServerUnitOrder, b: ServerUnitOrder) => a.orderedUnit.unitIndex - b.orderedUnit.unitIndex)

		/* Only allow moves to rows with no opposing units */
		queuedMoves = queuedMoves.filter(move => {
			const opponent = this.game.getOpponent(move.orderedUnit.owner)
			const opposingUnitsOnRow = move.targetRow.cards.filter(unit => unit.owner === opponent)
			return opposingUnitsOnRow.length === 0
		})

		/* Moves */
		queuedMoves.forEach(queuedMove => {
			this.performUnitMove(queuedMove.orderedUnit, queuedMove.targetRow)
		})

		/* After moves */
		const survivingMovers = queuedMoves.filter(move => move.orderedUnit.card.power > 0)
		survivingMovers.forEach(moveOrder => {
			runCardEventHandler(() => moveOrder.orderedUnit.card.onAfterPerformingMove(moveOrder.orderedUnit, moveOrder.targetRow))
		})

		/* Clear orders */
		this.queue = []
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.sendUnitOrders(playerInGame.player, this.queue)
		})
	}

	public performUnitAttack(orderedUnit: ServerCardOnBoard, targetUnit: ServerCardOnBoard): void {
		const attack = orderedUnit.card.getAttackDamage(orderedUnit, targetUnit)
		targetUnit.dealDamageWithoutDestroying(ServerDamageInstance.fromUnit(attack, orderedUnit))
	}

	public performUnitMove(orderedUnit: ServerCardOnBoard, targetRow: ServerGameBoardRow): void {
		const currentRow = this.game.board.getRowWithUnit(orderedUnit)
		if (!currentRow || targetRow.cards.length === Ruleset.MAX_CARDS_PER_ROW) { return }

		this.game.board.moveUnit(orderedUnit, targetRow.index, targetRow.cards.length)
	}
}
