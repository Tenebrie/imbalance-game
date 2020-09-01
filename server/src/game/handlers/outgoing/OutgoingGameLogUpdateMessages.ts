import ServerGame from '../../models/ServerGame'
import EventLogEntryMessage from '@shared/models/network/EventLogEntryMessage'
import {GameLogUpdateMessageType} from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'

export default {
	sendLogMessageGroup: (game: ServerGame, messages: EventLogEntryMessage[]): void => {
		game.players.forEach(playerInGame => {
			playerInGame.player.sendMessage({
				type: GameLogUpdateMessageType.ENTRY,
				data: messages,
				highPriority: true
			})
		})
	}
}
