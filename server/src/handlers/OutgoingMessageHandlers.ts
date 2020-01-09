import OutgoingBoardUpdateMessages from './outgoing/OutgoingBoardUpdateMessages'
import OutgoingChatUpdateMessages from './outgoing/OutgoingChatUpdateMessages'
import OutgoingGameStateMessages from './outgoing/OutgoingGameStateMessages'
import OutgoingHandUpdateMessages from './outgoing/OutgoingHandUpdateMessages'
import OutgoingSystemMessages from './outgoing/OutgoingSystemMessages'

export default {
	...OutgoingBoardUpdateMessages,
	...OutgoingChatUpdateMessages,
	...OutgoingGameStateMessages,
	...OutgoingHandUpdateMessages,
	...OutgoingSystemMessages
}
