import ServerCard from '../../models/ServerCard'
import ServerPlayer from '../../players/ServerPlayer'
import CardMessage from '../../shared/models/network/CardMessage'
import ServerCardOnBoard from '../../models/ServerCardOnBoard'
import CardOnBoardMessage from '../../shared/models/network/CardOnBoardMessage'

export default {
	notifyAboutUnitCreated(player: ServerPlayer, card: ServerCardOnBoard, rowIndex: number, unitIndex: number) {
		player.sendMessage({
			type: 'update/board/cardCreated',
			data: CardOnBoardMessage.fromCardOnBoardWithIndex(card, rowIndex, unitIndex)
		})
	},

	notifyAboutUnitDestroyed(player: ServerPlayer, cardOnBoard: ServerCardOnBoard) {
		player.sendMessage({
			type: 'update/board/cardDestroyed',
			data: CardMessage.fromCard(cardOnBoard.card)
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
