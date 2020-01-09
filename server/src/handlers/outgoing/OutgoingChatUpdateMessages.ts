import ServerChatEntry from '../../models/ServerChatEntry'
import ServerPlayer from '../../libraries/players/ServerPlayer'
import ChatEntryMessage from '../../shared/models/network/ChatEntryMessage'

export default {
	notifyAboutChatEntry(player: ServerPlayer, chatEntry: ServerChatEntry) {
		player.sendMessage({
			type: 'chat/message',
			data: ChatEntryMessage.fromChatEntry(chatEntry)
		})
	}
}
