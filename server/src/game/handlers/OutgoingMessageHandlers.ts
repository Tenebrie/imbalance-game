import OutgoingSystemMessages from './outgoing/OutgoingSystemMessages'
import OutgoingAnimationMessages from './outgoing/OutgoingAnimationMessages'
import OutgoingGameStateMessages from './outgoing/OutgoingGameStateMessages'
import OutgoingGameUpdateMessages from './outgoing/OutgoingGameUpdateMessages'
import OutgoingChatUpdateMessages from './outgoing/OutgoingChatUpdateMessages'
import OutgoingHandUpdateMessages from './outgoing/OutgoingHandUpdateMessages'
import OutgoingBoardUpdateMessages from './outgoing/OutgoingBoardUpdateMessages'
import OutgoingPlayerUpdateMessages from './outgoing/OutgoingPlayerUpdateMessages'

export default {
	...OutgoingAnimationMessages,
	...OutgoingBoardUpdateMessages,
	...OutgoingChatUpdateMessages,
	...OutgoingGameStateMessages,
	...OutgoingGameUpdateMessages,
	...OutgoingHandUpdateMessages,
	...OutgoingPlayerUpdateMessages,
	...OutgoingSystemMessages
}
