import { IncomingMessageHandlerFunction } from '@/Pixi/handlers/IncomingMessageHandlers'
import Core from '@/Pixi/Core'
import { TargetingMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import ResolvingCardTargetsMessage from '@shared/models/network/ResolvingCardTargetsMessage'
import AnonymousTargetsMessage from '@shared/models/network/AnonymousTargetsMessage'

const IncomingResolveStackMessages: { [index in TargetingMessageType]: IncomingMessageHandlerFunction } = {
	[TargetingMessageType.CARD_PLAY]: (data: ResolvingCardTargetsMessage) => {
		const validTargets = data.targets
		if (validTargets.length > 0) {
			Core.input.enableForcedTargetingMode(data.targetMode, validTargets, data.source)
		} else {
			Core.input.disableForcedTargetingMode()
		}
	},

	[TargetingMessageType.ANONYMOUS]: (data: AnonymousTargetsMessage) => {
		if (data.targets.length > 0) {
			Core.input.enableForcedTargetingMode(data.targetMode, data.targets, null)
		} else {
			Core.input.disableForcedTargetingMode()
		}
	},
}

export default IncomingResolveStackMessages
