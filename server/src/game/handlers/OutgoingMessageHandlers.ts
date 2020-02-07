import OutgoingAnimationMessages from './outgoing/OutgoingAnimationMessages'
import OutgoingBoardUpdateMessages from './outgoing/OutgoingBoardUpdateMessages'
import OutgoingCardUpdateMessages from './outgoing/OutgoingCardUpdateMessages'
import OutgoingChatUpdateMessages from './outgoing/OutgoingChatUpdateMessages'
import OutgoingGameStateMessages from './outgoing/OutgoingGameStateMessages'
import OutgoingGameUpdateMessages from './outgoing/OutgoingGameUpdateMessages'
import OutgoingPlayerUpdateMessages from './outgoing/OutgoingPlayerUpdateMessages'
import OutgoingSystemMessages from './outgoing/OutgoingSystemMessages'

export default {
	...OutgoingAnimationMessages,
	...OutgoingBoardUpdateMessages,
	...OutgoingCardUpdateMessages,
	...OutgoingChatUpdateMessages,
	...OutgoingGameStateMessages,
	...OutgoingGameUpdateMessages,
	...OutgoingPlayerUpdateMessages,
	...OutgoingSystemMessages
}
