import ServerCard from '../../models/ServerCard'
import ServerPlayer from '../../players/ServerPlayer'
import CardMessage from '../../shared/models/network/CardMessage'
import ServerCardOnBoard from '../../models/ServerCardOnBoard'
import CardOnBoardMessage from '../../shared/models/network/CardOnBoardMessage'
import GameBoardRow from '../../shared/models/GameBoardRow'
import GameBoardRowMessage from '../../shared/models/network/GameBoardRowMessage'
import CardTargetMessage from '../../shared/models/network/CardTargetMessage'
import ServerGame from '../../models/ServerGame'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'

export default {
	notifyAboutUnitCreated(player: ServerPlayer, card: ServerCardOnBoard, rowIndex: number, unitIndex: number) {
		player.sendMessage({
			type: 'update/board/unitCreated',
			data: CardOnBoardMessage.fromCardOnBoardWithIndex(card, rowIndex, unitIndex),
			highPriority: true
		})
		player.sendMessage({
			type: 'update/board/unitInserted',
			data: CardOnBoardMessage.fromCardOnBoardWithIndex(card, rowIndex, unitIndex)
		})
	},

	notifyAboutUnitMoved(player: ServerPlayer, card: ServerCardOnBoard, rowIndex: number, unitIndex: number) {
		player.sendMessage({
			type: 'update/board/unitMoved',
			data: CardOnBoardMessage.fromCardOnBoardWithIndex(card, rowIndex, unitIndex)
		})
	},

	notifyAboutUnitDestroyed(player: ServerPlayer, cardOnBoard: ServerCardOnBoard) {
		player.sendMessage({
			type: 'update/board/unitDestroyed',
			data: CardMessage.fromCard(cardOnBoard.card)
		})
	},

	notifyAboutUnitValidOrdersChanged(game: ServerGame, playerInGame: ServerPlayerInGame) {
		const ownedUnits = game.board.getUnitsOwnedByPlayer(playerInGame)
		const validOrders = ownedUnits.map(unit => unit.getValidOrders()).flat()
		const messages = validOrders.map(order => new CardTargetMessage(order))

		playerInGame.player.sendMessage({
			type: 'update/board/unitOrders',
			data: messages,
			highPriority: true
		})
	},

	notifyAboutOpponentUnitValidOrdersChanged(game: ServerGame, playerInGame: ServerPlayerInGame) {
		const opponentUnits = game.board.getUnitsOwnedByPlayer(game.getOpponent(playerInGame))
		const validOpponentOrders = opponentUnits.map(unit => unit.getValidOrders()).flat()
		const opponentMessages = validOpponentOrders.map(order => new CardTargetMessage(order))

		playerInGame.player.sendMessage({
			type: 'update/board/opponentOrders',
			data: opponentMessages
		})
	},

	notifyAboutRowOwnershipChanged(player: ServerPlayer, row: GameBoardRow) {
		player.sendMessage({
			type: 'update/board/row/owner',
			data: new GameBoardRowMessage(row)
		})
	},

	notifyAboutCardPowerChange(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/board/card/power',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutCardAttackChange(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/board/card/attack',
			data: CardMessage.fromCard(card)
		})
	}
}
