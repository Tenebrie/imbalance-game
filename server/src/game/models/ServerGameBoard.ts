import ServerGame from './ServerGame'
import Constants from '../shared/Constants'
import ServerCardOnBoard from './ServerCardOnBoard'
import GameBoard from '../shared/models/GameBoard'
import ServerGameBoardRow from './ServerGameBoardRow'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerGameBoardOrders from './ServerGameBoardOrders'

export default class ServerGameBoard extends GameBoard {
	game: ServerGame
	rows: ServerGameBoardRow[]
	orders: ServerGameBoardOrders

	constructor(game: ServerGame) {
		super()
		this.game = game
		this.rows = []
		this.orders = new ServerGameBoardOrders(game)
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

	public getUnitsOwnedByOpponent(thisPlayer: ServerPlayerInGame) {
		return this.getUnitsOwnedByPlayer(this.game.getOpponent(thisPlayer))
	}
}
