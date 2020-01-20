import ServerGame from './ServerGame'
import Constants from '../shared/Constants'
import ServerCardOnBoard from './ServerCardOnBoard'
import GameBoard from '../shared/models/GameBoard'
import ServerGameBoardRow from './ServerGameBoardRow'
import runCardEventHandler from '../utils/runCardEventHandler'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerDamageInstance from './ServerDamageSource'
import ServerUnitOrder from './ServerUnitOrder'
import UnitOrderType from '../shared/enums/UnitOrderType'
import VoidPlayerInGame from '../utils/VoidPlayerInGame'

export default class ServerGameBoard extends GameBoard {
	game: ServerGame
	rows: ServerGameBoardRow[]
	queuedOrders: ServerUnitOrder[]

	constructor(game: ServerGame) {
		super()
		this.game = game
		this.rows = []
		this.queuedOrders = []
		for (let i = 0; i < Constants.GAME_BOARD_ROW_COUNT; i++) {
			this.rows.push(new ServerGameBoardRow(game, i))
		}
	}

	public findCardById(cardId: string): ServerCardOnBoard | null {
		const cards = this.rows.map(row => row.cards).flat()
		return cards.find(cardOnBoard => cardOnBoard.card.id === cardId) || null
	}

	public getRowWithUnit(targetUnit: ServerCardOnBoard): ServerGameBoardRow | null {
		return this.rows.find(row => !!row.cards.find(unit => unit.card.id === targetUnit.card.id)) || null
	}

	public moveUnit(unit: ServerCardOnBoard, rowIndex: number, unitIndex: number) {
		const currentRow = this.rows[unit.rowIndex]
		const targetRow = this.rows[rowIndex]
		currentRow.removeUnit(unit)
		targetRow.insertUnit(unit, unitIndex)
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutUnitMoved(playerInGame.player, unit, rowIndex, unitIndex)
		})
		targetRow.setOwner(unit.owner)
	}

	public destroyUnit(unit: ServerCardOnBoard): void {
		const rowWithCard = this.getRowWithUnit(unit)
		if (!rowWithCard) {
			console.error(`No row includes unit ${unit.card.id}`)
			return
		}

		rowWithCard.destroyUnit(unit)
	}

	public getAllUnits() {
		return this.rows.map(row => row.cards).flat()
	}

	public getUnitsOwnedByPlayer(owner: ServerPlayerInGame) {
		return this.getAllUnits().filter(unit => unit.owner === owner)
	}

	public queueUnitOrder(order: ServerUnitOrder): void {
		const isOrderClear = this.queuedOrders.find(queuedOrder => queuedOrder.isEqual(order))
		this.queuedOrders = this.queuedOrders.filter(queuedOrder => !queuedOrder.isEqual(order))
		if (!isOrderClear) {
			this.queuedOrders.push(order)
		}
		OutgoingMessageHandlers.sendUnitOrders(order.orderedUnit.owner.player, this.queuedOrders)
	}

	public releaseQueuedOrders(): void {
		/* Before orders */
		const queuedAttacks = this.queuedOrders.filter(order => order.type === UnitOrderType.ATTACK)
		let queuedMoves = this.queuedOrders.filter(order => order.type === UnitOrderType.MOVE)
		queuedAttacks.forEach(queuedAttack => {
			runCardEventHandler(() => queuedAttack.orderedUnit.card.onBeforePerformingAttack(queuedAttack.orderedUnit, queuedAttack.targetUnit))
			runCardEventHandler(() => queuedAttack.orderedUnit.card.onBeforeBeingAttacked(queuedAttack.targetUnit, queuedAttack.orderedUnit))
		})
		queuedMoves.forEach(queuedMove => {
			runCardEventHandler(() => queuedMove.orderedUnit.card.onBeforePerformingMove(queuedMove.orderedUnit, queuedMove.targetRow))
		})

		/* Attacks */
		queuedAttacks.forEach(queuedAttack => {
			this.performUnitAttack(queuedAttack.orderedUnit, queuedAttack.targetUnit)
		})

		/* Moves */
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
		queuedMoves.forEach(queuedMove => {
			this.performUnitMove(queuedMove.orderedUnit, queuedMove.targetRow)
		})

		/* Destroy killed units */
		const killedUnits = this.getAllUnits().filter(unit => unit.card.power <= 0)
		killedUnits.forEach(destroyedUnit => {
			destroyedUnit.destroy()
		})

		/* After attacks */
		const survivingAttackers = queuedAttacks.filter(attack => attack.orderedUnit.card.power > 0)
		const survivingTargets = queuedAttacks.filter(attack => attack.targetUnit.card.power > 0)
		const survivingMovers = queuedMoves.filter(move => move.orderedUnit.card.power > 0)
		survivingAttackers.forEach(attackOrder => {
			runCardEventHandler(() => attackOrder.orderedUnit.card.onAfterPerformingAttack(attackOrder.orderedUnit, attackOrder.targetUnit))
		})
		survivingTargets.forEach(attackOrder => {
			runCardEventHandler(() => attackOrder.targetUnit.card.onAfterBeingAttacked(attackOrder.targetUnit, attackOrder.orderedUnit))
		})
		survivingMovers.forEach(moveOrder => {
			runCardEventHandler(() => moveOrder.targetUnit.card.onAfterPerformingMove(moveOrder.orderedUnit, moveOrder.targetRow))
		})

		this.queuedOrders = []
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.sendUnitOrders(playerInGame.player, this.queuedOrders)
		})
	}

	public performUnitAttack(orderedUnit: ServerCardOnBoard, targetUnit: ServerCardOnBoard): void {
		const attack = orderedUnit.card.attack
		targetUnit.dealDamageWithoutDestroying(ServerDamageInstance.fromUnit(attack, orderedUnit))
	}

	public performUnitMove(orderedUnit: ServerCardOnBoard, targetRow: ServerGameBoardRow): void {
		const currentRow = this.game.board.getRowWithUnit(orderedUnit)
		if (!currentRow) { return }

		this.moveUnit(orderedUnit, targetRow.index, targetRow.cards.length)
	}
}
