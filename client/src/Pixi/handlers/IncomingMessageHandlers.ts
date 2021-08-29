import { ServerToClientMessageTypes } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'

import IncomingAnimationMessages from '@/Pixi/handlers/incoming/IncomingAnimationMessages'
import IncomingBoardUpdateMessages from '@/Pixi/handlers/incoming/IncomingBoardUpdateMessages'
import IncomingCardUpdateMessages from '@/Pixi/handlers/incoming/IncomingCardUpdateMessages'
import IncomingGameLogUpdateMessages from '@/Pixi/handlers/incoming/IncomingGameLogUpdateMessages'
import IncomingGameSyncMessages from '@/Pixi/handlers/incoming/IncomingGameSyncMessages'
import IncomingNovelMessages from '@/Pixi/handlers/incoming/IncomingNovelMessages'
import IncomingPlayerUpdateMessages from '@/Pixi/handlers/incoming/IncomingPlayerUpdateMessages'
import IncomingResolveStackMessages from '@/Pixi/handlers/incoming/IncomingResolveStackMessages'
import IncomingSystemMessages from '@/Pixi/handlers/incoming/IncomingSystemMessages'
import IncomingTargetingMessages from '@/Pixi/handlers/incoming/IncomingTargetingMessages'
import { QueuedMessageSystemData } from '@/Pixi/models/QueuedMessage'

export type IncomingMessageHandlerFunction = (data: any, systemData: QueuedMessageSystemData) => void

const IncomingMessageHandlers: { [index in ServerToClientMessageTypes]: IncomingMessageHandlerFunction } = {
	...IncomingAnimationMessages,
	...IncomingBoardUpdateMessages,
	...IncomingCardUpdateMessages,
	...IncomingGameLogUpdateMessages,
	...IncomingGameSyncMessages,
	...IncomingNovelMessages,
	...IncomingPlayerUpdateMessages,
	...IncomingResolveStackMessages,
	...IncomingTargetingMessages,
	...IncomingSystemMessages,
}

export default IncomingMessageHandlers
