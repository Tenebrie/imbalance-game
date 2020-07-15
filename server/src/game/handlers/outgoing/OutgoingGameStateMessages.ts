import ServerPlayer from '../../players/ServerPlayer'
import GameStartMessage from '@shared/models/network/GameStartMessage'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'
import HiddenPlayerInGameMessage from '@shared/models/network/HiddenPlayerInGameMessage'
import PlayerInGameMessage from '@shared/models/network/PlayerInGameMessage'
import ServerGame from '../../models/ServerGame'
import EventLogEntryMessage from '@shared/models/network/EventLogEntryMessage'

export default {
	notifyAboutGameStart(player: ServerPlayer, isBoardInverted: boolean) {
		player.sendMessage({
			type: 'gameState/start',
			data: new GameStartMessage(isBoardInverted)
		})
	},

	sendPlayerSelf: (player: ServerPlayer, self: ServerPlayerInGame) => {
		player.sendMessage({
			type: 'gameState/player/self',
			data: PlayerInGameMessage.fromPlayerInGame(self)
		})
	},

	sendPlayerOpponent: (player: ServerPlayer, opponent: ServerPlayerInGame) => {
		player.sendMessage({
			type: 'gameState/player/opponent',
			data: HiddenPlayerInGameMessage.fromPlayerInGame(opponent)
		})
	}
}
