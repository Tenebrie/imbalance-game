import EventLogEntryMessage from '@shared/models/network/EventLogEntryMessage'
import { GameLogUpdateMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'

import ServerGame from '../../models/ServerGame'

export default {
	sendLogMessageGroup: (game: ServerGame, messages: EventLogEntryMessage[]): void => {
		game.players
			.flatMap((playerGroup) => playerGroup.players)
			.forEach((playerInGame) => {
				playerInGame.player.sendGameMessage({
					type: GameLogUpdateMessageType.ENTRY,
					data: messages,
					highPriority: true,
				})
			})
	},
}
