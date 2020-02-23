import ServerGame from './ServerGame'
import Constants from '../shared/Constants'
import ServerCardOnBoard from './ServerCardOnBoard'
import GameBoard from '../shared/models/GameBoard'
import ServerGameBoardRow from './ServerGameBoardRow'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerGameBoardOrders from './ServerGameBoardOrders'
import ServerCard from './ServerCard'

export default class ServerGameBoard extends GameBoard {
	readonly game: ServerGame
	readonly rows: ServerGameBoardRow[]
	readonly orders: ServerGameBoardOrders

	constructor(game: ServerGame) {
		super()
		this.game = game
		this.rows = []
		this.orders = new ServerGameBoardOrders(game)
		for (let i = 0; i < Constants.GAME_BOARD_ROW_COUNT; i++) {
			this.rows.push(new ServerGameBoardRow(game, i))
		}
	}

	public findUnitById(cardId: string): ServerCardOnBoard | null {
		const cards = this.rows.map(row => row.cards).flat()
		return cards.find(cardOnBoard => cardOnBoard.card.id === cardId) || null
	}

	public getRowWithUnit(targetUnit: ServerCardOnBoard): ServerGameBoardRow | null {
		return this.rows.find(row => !!row.cards.find(unit => unit.card.id === targetUnit.card.id)) || null
	}

	public getAdjacentRows(targetRow: ServerGameBoardRow): ServerGameBoardRow[] {
		let adjacentRows = []
		if (targetRow.index > 0) { adjacentRows.push(this.game.board.rows[targetRow.index - 1]) }
		if (targetRow.index < Constants.GAME_BOARD_ROW_COUNT - 1) { adjacentRows.push(this.game.board.rows[targetRow.index + 1]) }
		return adjacentRows
	}

	public getDeployDistance(targetRow: ServerGameBoardRow, playerInGame: ServerPlayerInGame): number {
		const playersRows = this.rows.filter(row => row.owner === playerInGame)
		if (playersRows.length === 0) {
			return targetRow === this.getPlayerHomeRow(playerInGame) ? 0 : Infinity
		}

		const distanceToRow = playersRows.map(row => row.distanceTo(targetRow))
		return distanceToRow.sort()[0]
	}

	public getPlayerHomeRow(playerInGame: ServerPlayerInGame): ServerGameBoardRow {
		return this.rows[this.game.players.indexOf(playerInGame) === 0 ? Constants.GAME_BOARD_ROW_COUNT - 1 : 0]
	}

	public getTotalPlayerPower(playerInGame: ServerPlayerInGame): number {
		return this.getUnitsOwnedByPlayer(playerInGame).map(unit => unit.card.power).reduce((total, value) => total + value, 0)
	}

	public getHorizontalUnitDistance(first: ServerCardOnBoard, second: ServerCardOnBoard): number {
		const firstOffsetFromCenter = first.unitIndex - ((this.rows[first.rowIndex].cards.length - 1) / 2)
		const secondOffsetFromCenter = second.unitIndex - ((this.rows[second.rowIndex].cards.length - 1) / 2)
		return Math.abs(firstOffsetFromCenter - secondOffsetFromCenter)
	}

	public getTotalBuffIntensityForPlayer(buffPrototype: any, player: ServerPlayerInGame): number {
		return this.getUnitsOwnedByPlayer(player).map(unit => unit.card.cardBuffs.getIntensity(buffPrototype)).reduce((total, value) => total + value, 0)
	}

	public getAllUnits() {
		return this.rows.map(row => row.cards).flat()
	}

	public getUnitsOwnedByPlayer(owner: ServerPlayerInGame) {
		return this.getAllUnits().filter(unit => unit.owner === owner)
	}

	public getUnitsOwnedByOpponent(thisPlayer: ServerPlayerInGame) {
		return this.getUnitsOwnedByPlayer(this.game.getOpponent(thisPlayer))
	}

	public createUnit(card: ServerCard, owner: ServerPlayerInGame, rowIndex: number, unitIndex: number): ServerCardOnBoard {
		const unit = new ServerCardOnBoard(this.game, card, owner)
		this.rows[rowIndex].insertUnit(unit, unitIndex)
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutUnitCreated(playerInGame.player, unit, rowIndex, unitIndex)
		})
		return unit
	}

	public moveUnit(unit: ServerCardOnBoard, rowIndex: number, unitIndex: number) {
		const currentRow = this.rows[unit.rowIndex]
		const targetRow = this.rows[rowIndex]
		currentRow.removeUnit(unit)
		targetRow.insertUnit(unit, unitIndex)
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutUnitMoved(playerInGame.player, unit, rowIndex, unitIndex)
		})
	}

	public destroyUnit(unit: ServerCardOnBoard): void {
		const rowWithCard = this.getRowWithUnit(unit)
		if (!rowWithCard) {
			console.error(`No row includes unit ${unit.card.id}`)
			return
		}

		rowWithCard.destroyUnit(unit)
	}
}
