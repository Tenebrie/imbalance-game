import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerGame from '../models/ServerGame'
import ServerCardDeck from '../models/ServerCardDeck'
import ServerPlayer from '../players/ServerPlayer'
import IncomingMessageHandlers from '../handlers/IncomingMessageHandlers'
import CardPlayedMessage from '../shared/models/network/CardPlayedMessage'
import UnitOrderMessage from '../shared/models/network/UnitOrderMessage'
import ServerUnitOrder from '../models/ServerUnitOrder'
import ServerCard from '../models/ServerCard'
import Utils from '../../utils/Utils'
import ServerCardOnBoard from '../models/ServerCardOnBoard'
import ServerGameBoardRow from '../models/ServerGameBoardRow'

export default class ServerBotPlayerInGame extends ServerPlayerInGame {
	constructor(game: ServerGame, player: ServerPlayer, cardDeck: ServerCardDeck) {
		super(game, player, cardDeck)
		this.initialized = true
	}

	public startTurn(): void {
		super.startTurn()

		setTimeout(() => {
			this.botTakesTheirTurn()
		}, 0)
	}

	private botTakesTheirTurn(): void {
		try {
			while (this.timeUnits > 0) {
				this.botPlaysCard()
			}
			this.botOrdersAttacks()
			this.botOrdersMove()
		} catch (e) {
			console.error('Unknown AI error', e)
		}
		this.botEndsTurn()
	}

	private botPlaysCard(): void {
		if (this.cardHand.isEmpty()) { return }

		const cards = this.cardHand.cards.slice().sort((a: ServerCard, b: ServerCard) => {
			return a.cardType - b.cardType || (b.unitSubtype ? b.unitSubtype : 10) - (a.unitSubtype ? a.unitSubtype : 10) || b.power - a.power || Utils.hashCode(a.cardClass) - Utils.hashCode(b.cardClass)
		})
		const selectedCard = cards[0]

		const ownedRows = this.sortOwnedRows(this.game.board.rows.filter(row => row.owner === this))
		const distanceFromFront = selectedCard.attackRange - 1
		const targetRow = ownedRows[Math.min(distanceFromFront, ownedRows.length - 1)]
		const cardPlayerMessage = CardPlayedMessage.fromCardOnRow(selectedCard, targetRow.index, targetRow.cards.length)
		IncomingMessageHandlers['post/playCard'](cardPlayerMessage, this.game, this)
	}

	private botOrdersAttacks(): void {
		const controlledUnits = this.game.board.getUnitsOwnedByPlayer(this).filter(unit => unit.getValidOrders().length > 0)
		controlledUnits.forEach(unit => {
			if (unit.isDead()) { return }

			const opponentsUnits = this.game.board.getUnitsOwnedByOpponent(this)
			const validTargets = opponentsUnits.filter(opponentsUnit => unit.canAttackTarget(opponentsUnit))
			if (validTargets.length === 0) { return }

			const sortedTargets = this.sortValidTargets(validTargets)

			const unitOrder = ServerUnitOrder.attack(unit, sortedTargets[0])
			const unitOrderMessage = new UnitOrderMessage(unitOrder)
			IncomingMessageHandlers['post/unitOrder'](unitOrderMessage, this.game, this)
		})
	}

	private botOrdersMove(): void {
		const controlledUnits = this.game.board.getUnitsOwnedByPlayer(this).filter(unit => unit.getValidOrders().length > 0)
		controlledUnits.forEach(unit => {
			const unitOrder = ServerUnitOrder.move(unit, this.game.board.rows[this.getForwardRowIndex(unit.rowIndex)])
			const unitOrderMessage = new UnitOrderMessage(unitOrder)
			IncomingMessageHandlers['post/unitOrder'](unitOrderMessage, this.game, this)
		})
	}

	private botEndsTurn(): void {
		IncomingMessageHandlers['post/endTurn'](null, this.game, this)
	}

	private isInvertedBoard(): boolean {
		return this.game.players.indexOf(this) === 1
	}

	private sortOwnedRows(ownedRows: ServerGameBoardRow[]): ServerGameBoardRow[] {
		if (this.isInvertedBoard()) {
			return ownedRows.slice().sort((a, b) => b.index - a.index)
		} else {
			return ownedRows.slice().sort((a, b) => a.index - b.index)
		}

	}

	private getForwardRowIndex(rowIndex: number): number {
		if (this.isInvertedBoard()) {
			return rowIndex + 1
		} else {
			return rowIndex - 1
		}
	}

	private sortValidTargets(validTargets: ServerCardOnBoard[]): ServerCardOnBoard[] {
		if (this.isInvertedBoard()) {
			return validTargets.slice().sort((a, b) => b.rowIndex - a.rowIndex || a.unitIndex - b.unitIndex)
		} else {
			return validTargets.slice().sort((a, b) => a.rowIndex - b.rowIndex || a.unitIndex - b.unitIndex)
		}
	}

	static newInstance(game: ServerGame, player: ServerPlayer, cardDeck: ServerCardDeck) {
		return new ServerBotPlayerInGame(game, player, cardDeck)
	}
}
