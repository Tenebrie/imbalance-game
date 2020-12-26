import { IncomingMessageHandlerFunction } from '@/Pixi/handlers/IncomingMessageHandlers'
import Core from '@/Pixi/Core'
import GameStartMessage from '@shared/models/network/GameStartMessage'
import store from '@/Vue/store'
import RenderedCardHand from '@/Pixi/models/RenderedCardHand'
import ClientCardDeck from '@/Pixi/models/ClientCardDeck'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import PlayerInGameMessage from '@shared/models/network/playerInGame/PlayerInGameMessage'
import { GameSyncMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import BoardMessage from '@shared/models/network/BoardMessage'
import RenderedUnit from '@/Pixi/cards/RenderedUnit'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import PlayerInGameRefMessage from '@shared/models/network/playerInGame/PlayerInGameRefMessage'
import ResolveStackMessage from '@shared/models/network/resolveStack/ResolveStackMessage'

const IncomingGameSyncMessages: { [index in GameSyncMessageType]: IncomingMessageHandlerFunction } = {
	[GameSyncMessageType.START]: (data: GameStartMessage) => {
		Core.board.setInverted(data.isBoardInverted)
		store.dispatch.gameStateModule.startGame()
	},

	[GameSyncMessageType.PHASE_ADVANCE]: (data: GameTurnPhase) => {
		store.commit.gameStateModule.setTurnPhase(data)
	},

	[GameSyncMessageType.PLAYER_SELF]: (data: PlayerInGameMessage) => {
		Core.player.player.id = data.player.id
		Core.player.player.username = data.player.username
		Core.player.cardHand = RenderedCardHand.fromMessage(data.cardHand)
		Core.player.cardDeck = ClientCardDeck.fromMessage(data.cardDeck)
		Core.player.cardGraveyard = ClientCardDeck.fromMessage(data.cardGraveyard)
		Core.player.morale = data.morale
		Core.player.setUnitMana(data.unitMana)
		Core.player.setSpellMana(data.spellMana)
	},

	[GameSyncMessageType.PLAYER_OPPONENT]: (data: PlayerInGameMessage) => {
		const playerInGame = ClientPlayerInGame.fromMessage(data)
		Core.registerOpponent(playerInGame)
		store.commit.gameStateModule.setOpponentData(playerInGame.player)
	},

	[GameSyncMessageType.BOARD_STATE]: (data: BoardMessage) => {
		Core.board.clearBoard()
		data.rows.forEach((row) => {
			Core.board.rows[row.index].owner = Core.getPlayerOrNull(row.ownerId)
			Core.board.rows[row.index].cards = row.cards.map(
				(unit) => new RenderedUnit(RenderedCard.fromMessage(unit.card), Core.getPlayer(unit.ownerId))
			)
		})
	},

	[GameSyncMessageType.STACK_STATE]: (data: ResolveStackMessage) => {
		data.entries.forEach((entry) => {
			Core.resolveStack.addCard(RenderedCard.fromMessage(entry.ownedCard.card), Core.getPlayer(entry.ownedCard.owner.player.id))
		})
	},

	[GameSyncMessageType.ACTIVE_PLAYER]: (data: PlayerInGameRefMessage) => {
		Core.getPlayer(data.playerId).startTurn()
	},
}

export default IncomingGameSyncMessages
