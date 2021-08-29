import OutgoingAnimationMessages from './outgoing/OutgoingAnimationMessages'
import OutgoingBoardUpdateMessages from './outgoing/OutgoingBoardUpdateMessages'
import OutgoingCardUpdateMessages from './outgoing/OutgoingCardUpdateMessages'
import OutgoingGameLogUpdateMessages from './outgoing/OutgoingGameLogUpdateMessages'
import OutgoingGameSyncMessages from './outgoing/OutgoingGameSyncMessages'
import OutgoingPlayerUpdateMessages from './outgoing/OutgoingPlayerUpdateMessages'
import OutgoingResolveStackUpdateMessages from './outgoing/OutgoingResolveStackMessages'
import OutgoingSystemMessages from './outgoing/OutgoingSystemMessages'
import OutgoingTargetingMessages from './outgoing/OutgoingTargetingMessages'

export default {
	...OutgoingAnimationMessages,
	...OutgoingBoardUpdateMessages,
	...OutgoingCardUpdateMessages,
	...OutgoingGameLogUpdateMessages,
	...OutgoingGameSyncMessages,
	...OutgoingPlayerUpdateMessages,
	...OutgoingResolveStackUpdateMessages,
	...OutgoingTargetingMessages,
	...OutgoingSystemMessages,
}
