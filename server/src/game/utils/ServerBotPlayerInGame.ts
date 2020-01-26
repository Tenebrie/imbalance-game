import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerGame from '../models/ServerGame'
import ServerCardDeck from '../models/ServerCardDeck'
import ServerPlayer from '../players/ServerPlayer'
import IncomingMessageHandlers from '../handlers/IncomingMessageHandlers'
import GameTurnPhase from '../shared/enums/GameTurnPhase'
import CardPlayedMessage from '../shared/models/network/CardPlayedMessage'
import UnitOrderMessage from '../shared/models/network/UnitOrderMessage'
import ServerUnitOrder from '../models/ServerUnitOrder'
import ServerCard from '../models/ServerCard'
import Utils from '../../utils/Utils'

export default class ServerBotPlayerInGame extends ServerPlayerInGame {
	constructor(game: ServerGame, player: ServerPlayer, cardDeck: ServerCardDeck) {
		super(game, player, cardDeck)
		this.initialized = true
	}

	public startTurn(): void {
		super.startTurn()

		if (this.game.turnPhase === GameTurnPhase.DEPLOY) {
			this.botPlaysCard()
		} else if (this.game.turnPhase === GameTurnPhase.SKIRMISH) {
			this.botOrdersMove()
			this.botOrdersAttacks()
		}
		this.botEndsTurn()
	}

	private botPlaysCard(): void {
		if (this.cardHand.isEmpty()) { return }

		const cards = this.cardHand.cards.slice().sort((a: ServerCard, b: ServerCard) => {
			return a.cardType - b.cardType || (b.unitSubtype ? b.unitSubtype : 10) - (a.unitSubtype ? a.unitSubtype : 10) || b.power - a.power || Utils.hashCode(a.cardClass) - Utils.hashCode(b.cardClass)
		})
		const selectedCard = cards[0]

		const ownedRows = this.game.board.rows.filter(row => row.owner === this).sort((a, b) => a.index - b.index)
		const distanceFromFront = selectedCard.attackRange - 1
		const targetRow = ownedRows[Math.min(distanceFromFront, ownedRows.length - 1)]
		const cardPlayerMessage = CardPlayedMessage.fromCardOnRow(selectedCard, targetRow.index, targetRow.cards.length)
		IncomingMessageHandlers['post/playCard'](cardPlayerMessage, this.game, this)
	}

	private botOrdersMove(): void {
		const controlledUnits = this.game.board.getUnitsOwnedByPlayer(this)
		controlledUnits.forEach(unit => {
			const unitOrder = ServerUnitOrder.move(unit, this.game.board.rows[unit.rowIndex - 1])
			const unitOrderMessage = new UnitOrderMessage(unitOrder)
			IncomingMessageHandlers['post/unitOrder'](unitOrderMessage, this.game, this)
		})
	}

	private botOrdersAttacks(): void {
		const controlledUnits = this.game.board.getUnitsOwnedByPlayer(this)
		const opponentsUnits = this.game.board.getUnitsOwnedByOpponent(this)
		controlledUnits.forEach(unit => {
			const validTargets = opponentsUnits.filter(opponentsUnit => unit.canAttackTarget(opponentsUnit))
			if (validTargets.length === 0) { return }

			const sortedTargets = validTargets.sort((a, b) => a.rowIndex - b.rowIndex || a.unitIndex - b.unitIndex)

			const unitOrder = ServerUnitOrder.attack(unit, sortedTargets[0])
			const unitOrderMessage = new UnitOrderMessage(unitOrder)
			IncomingMessageHandlers['post/unitOrder'](unitOrderMessage, this.game, this)
		})
	}

	private botEndsTurn(): void {
		setTimeout(() => {
			IncomingMessageHandlers['post/endTurn'](null, this.game, this)
		}, 0)
	}

	static newInstance(game: ServerGame, player: ServerPlayer, cardDeck: ServerCardDeck) {
		return new ServerBotPlayerInGame(game, player, cardDeck)
	}
}
