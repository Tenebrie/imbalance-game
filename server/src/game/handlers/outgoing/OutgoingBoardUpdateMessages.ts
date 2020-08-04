import ServerCard from '../../models/ServerCard'
import ServerPlayer from '../../players/ServerPlayer'
import CardMessage from '@shared/models/network/CardMessage'
import ServerUnit from '../../models/ServerUnit'
import UnitMessage from '@shared/models/network/UnitMessage'
import BoardRow from '@shared/models/BoardRow'
import BoardRowMessage from '@shared/models/network/BoardRowMessage'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import ServerGame from '../../models/ServerGame'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'
import Utils from '../../../utils/Utils'
import BuffTutoredCard from '../../buffs/BuffTutoredCard'

export default {
	notifyAboutUnitCreated(player: ServerPlayer, card: ServerUnit, rowIndex: number, unitIndex: number) {
		player.sendMessage({
			type: 'update/board/unitCreated',
			data: UnitMessage.fromCardOnBoardWithIndex(card, rowIndex, unitIndex),
			highPriority: true
		})
		player.sendMessage({
			type: 'update/board/unitInserted',
			data: UnitMessage.fromCardOnBoardWithIndex(card, rowIndex, unitIndex)
		})
	},

	notifyAboutUnitMoved(player: ServerPlayer, card: ServerUnit, rowIndex: number, unitIndex: number) {
		player.sendMessage({
			type: 'update/board/unitMoved',
			data: UnitMessage.fromCardOnBoardWithIndex(card, rowIndex, unitIndex)
		})
	},

	notifyAboutUnitDestroyed(player: ServerPlayer, cardOnBoard: ServerUnit) {
		player.sendMessage({
			type: 'update/board/unitDestroyed',
			data: CardMessage.fromCard(cardOnBoard.card)
		})
	},

	notifyAboutValidActionsChanged(game: ServerGame, playerInGame: ServerPlayerInGame) {
		const cardsInHand = playerInGame.cardHand.allCards
		const validPlayTargets = Utils.flat(cardsInHand.map(card => card.getValidPlayTargets(playerInGame)))
		const playTargetMessages = validPlayTargets.map(order => new CardTargetMessage(order))
		playerInGame.player.sendMessage({
			type: 'update/player/self/hand/playTargets',
			data: playTargetMessages
		})

		const ownedUnits = game.board.getUnitsOwnedByPlayer(playerInGame)
		const validOrders = Utils.flat(ownedUnits.map(unit => unit.getValidOrders()))
		const messages = validOrders.map(order => new CardTargetMessage(order))

		playerInGame.player.sendMessage({
			type: 'update/board/unitOrders',
			data: messages,
			highPriority: true
		})
		playerInGame.opponent.player.sendMessage({
			type: 'update/board/opponentOrders',
			data: messages
		})
	},

	notifyAboutRowOwnershipChanged(player: ServerPlayer, row: BoardRow) {
		player.sendMessage({
			type: 'update/board/row/owner',
			data: new BoardRowMessage(row)
		})
	},

	notifyAboutCardPowerChange(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/card/power',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutCardMaxPowerChange(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/card/maxPower',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutCardArmorChange(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/card/armor',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutCardMaxArmorChange(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/card/maxArmor',
			data: CardMessage.fromCard(card)
		})
	}
}
