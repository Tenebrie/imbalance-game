import ServerCard from '../../models/ServerCard'
import ServerPlayer from '../../players/ServerPlayer'
import CardMessage from '../../shared/models/network/CardMessage'
import ServerCardOnBoard from '../../models/ServerCardOnBoard'
import CardOnBoardMessage from '../../shared/models/network/CardOnBoardMessage'
import GameBoardRow from '../../shared/models/GameBoardRow'
import GameBoardRowMessage from '../../shared/models/network/GameBoardRowMessage'

export default {
	notifyAboutUnitCreated(player: ServerPlayer, card: ServerCardOnBoard, rowIndex: number, unitIndex: number) {
		player.sendMessage({
			type: 'update/board/unitCreated',
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
