import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerGame from '../models/ServerGame'
import ServerPlayer from '../players/ServerPlayer'
import IncomingMessageHandlers from '../handlers/IncomingMessageHandlers'
import CardPlayedMessage from '@shared/models/network/CardPlayedMessage'
import UnitOrderMessage from '@shared/models/network/CardTargetMessage'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import ServerCardTarget from '../models/ServerCardTarget'
import ServerCard from '../models/ServerCard'
import Utils from '../../utils/Utils'
import ServerUnit from '../models/ServerUnit'
import ServerBoardRow from '../models/ServerBoardRow'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import ServerTemplateCardDeck from '../models/ServerTemplateCardDeck'
import GameTurnPhase from '@shared/enums/GameTurnPhase'

export default class ServerBotPlayerInGame extends ServerPlayerInGame {
	constructor(game: ServerGame, player: ServerPlayer) {
		super(game, player)
		this.initialized = true
	}

	public startTurn(): void {
		super.startTurn()

		setTimeout(() => {
			this.botTakesTheirTurn()
		}, 0)
	}

	private botTakesTheirTurn(): void {
		const botTotalPower = this.game.board.getTotalPlayerPower(this)
		const opponentTotalPower = this.game.board.getTotalPlayerPower(this.opponent)
		if (botTotalPower > opponentTotalPower) {
			this.botEndsTurn()
			return
		}

		try {
			while (this.unitMana > 0 && this.cardHand.unitCards.length > 0 && this.game.turnPhase === GameTurnPhase.DEPLOY) {
				this.botPlaysCard()
				while (this.game.cardPlay.cardResolveStack.hasCards()) {
					this.botChoosesTarget()
				}
			}
			this.botOrdersAttacks()
			this.botOrdersMove()
		} catch (e) {
			console.error('Unknown AI error', e)
		}
		this.botEndsTurn()
	}

	private botPlaysCard(): void {
		const cards = this.cardHand.unitCards.slice().sort((a: ServerCard, b: ServerCard) => {
			return a.type - b.type || (b.color ? b.color : 10) - (a.color ? a.color : 10) || b.power - a.power || Utils.hashCode(a.class) - Utils.hashCode(b.class)
		})
		const selectedCard = cards[0]

		let validRows = this.game.board.rows.filter(row => row.owner === this)

		const distanceFromFront = selectedCard.attackRange - 1
		const targetRow = validRows[Math.min(distanceFromFront, validRows.length - 1)]
		const cardPlayerMessage = CardPlayedMessage.fromCardOnRow(selectedCard, targetRow.index, targetRow.cards.length)
		IncomingMessageHandlers['post/playCard'](cardPlayerMessage, this.game, this)
	}

	private botChoosesTarget(): void {
		const validTargets = this.game.cardPlay.getValidTargets()
		const cardTargetMessage = new CardTargetMessage(validTargets[0])
		IncomingMessageHandlers['post/cardTarget'](cardTargetMessage, this.game, this)
	}

	private botOrdersAttacks(): void {
		const controlledUnits = this.game.board.getUnitsOwnedByPlayer(this).filter(unit => unit.getValidOrders().length > 0)
		controlledUnits.forEach(unit => {
			if (unit.isDead()) { return }

			const opponentsUnits = this.game.board.getUnitsOwnedByOpponent(this)
			const targetDefinition = unit.card.getValidOrderTargetDefinition()
			const validTargets = opponentsUnits.filter(opponentUnit => {
				const previousTargets = this.game.board.orders.getOrdersPerformedByUnit(opponentUnit)
				return targetDefinition.validate(TargetMode.ORDER_ATTACK, TargetType.UNIT, {
					thisUnit: unit,
					targetUnit: opponentUnit,
					previousTargets
				})
			})
			if (validTargets.length === 0) { return }

			const sortedTargets = this.sortValidTargets(validTargets)

			const unitOrder = ServerCardTarget.unitTargetUnit(TargetMode.ORDER_ATTACK, unit, sortedTargets[0])

			const unitOrderMessage = new UnitOrderMessage(unitOrder)
			IncomingMessageHandlers['post/unitOrder'](unitOrderMessage, this.game, this)
		})
	}

	private botOrdersMove(): void {
		const controlledUnits = this.game.board.getUnitsOwnedByPlayer(this).filter(unit => unit.getValidOrders().length > 0)
		controlledUnits.forEach(unit => {
			const unitOrder = ServerCardTarget.unitTargetRow(TargetMode.ORDER_MOVE, unit, this.game.board.rows[this.getForwardRowIndex(unit.rowIndex)])
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

	private sortOwnedRows(ownedRows: ServerBoardRow[]): ServerBoardRow[] {
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

	private sortValidTargets(validTargets: ServerUnit[]): ServerUnit[] {
		if (this.isInvertedBoard()) {
			return validTargets.slice().sort((a, b) => b.rowIndex - a.rowIndex || a.unitIndex - b.unitIndex)
		} else {
			return validTargets.slice().sort((a, b) => a.rowIndex - b.rowIndex || a.unitIndex - b.unitIndex)
		}
	}

	static newInstance(game: ServerGame, player: ServerPlayer, cardDeck: ServerTemplateCardDeck) {
		const playerInGame = new ServerBotPlayerInGame(game, player)
		playerInGame.cardDeck.instantiateFrom(cardDeck)
		return playerInGame
	}
}
