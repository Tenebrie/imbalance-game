import {IncomingMessageHandlerFunction} from '@/Pixi/handlers/IncomingMessageHandlers'
import Core from '@/Pixi/Core'
import GameStartMessage from '@shared/models/network/GameStartMessage'
import store from '@/Vue/store'
import RenderedCardHand from '@/Pixi/models/RenderedCardHand'
import ClientCardDeck from '@/Pixi/models/ClientCardDeck'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import PlayerInGameMessage from '@shared/models/network/playerInGame/PlayerInGameMessage'
import {GameSyncMessageType} from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'

const IncomingGameSyncMessages: {[ index in GameSyncMessageType ]: IncomingMessageHandlerFunction } = {
	[GameSyncMessageType.START]: (data: GameStartMessage) => {
		Core.board.setInverted(data.isBoardInverted)
		store.dispatch.gameStateModule.startGame()
	},

	[GameSyncMessageType.PHASE_ADVANCE]: (data: GameTurnPhase) => {
		Core.game.setTurnPhase(data)
	},

	[GameSyncMessageType.PLAYER_SELF]: (data: PlayerInGameMessage) => {
		Core.player.cardHand = RenderedCardHand.fromMessage(data.cardHand)
		Core.player.cardDeck = ClientCardDeck.fromMessage(data.cardDeck)
		Core.player.morale = data.morale
		Core.player.setUnitMana(data.unitMana)
		Core.player.setSpellMana(data.spellMana)
	},

	[GameSyncMessageType.PLAYER_OPPONENT]: (data: PlayerInGameMessage) => {
		const playerInGame = ClientPlayerInGame.fromMessage(data)
		Core.registerOpponent(playerInGame)
		store.commit.gameStateModule.setOpponentData(playerInGame.player)
	},
}

export default IncomingGameSyncMessages
