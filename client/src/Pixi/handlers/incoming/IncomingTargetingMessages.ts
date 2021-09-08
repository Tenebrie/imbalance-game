import TargetMode from '@shared/enums/TargetMode'
import AnonymousTargetsMessage from '@shared/models/network/AnonymousTargetsMessage'
import InvalidCardTargetMessage from '@shared/models/network/InvalidCardTargetMessage'
import { TargetingMessageHandlers, TargetingMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import ResolvingCardTargetsMessage from '@shared/models/network/ResolvingCardTargetsMessage'

import Core from '@/Pixi/Core'

const IncomingResolveStackMessages: TargetingMessageHandlers = {
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

	[TargetingMessageType.INVALID]: (data: InvalidCardTargetMessage) => {
		if (
			data.targetMode === TargetMode.CARD_PLAY &&
			Core.input.tutoredShadowUnit &&
			Core.input.tutoredShadowUnit.card &&
			Core.input.tutoredShadowUnit.card.id === data.source.id
		) {
			Core.input.tutoredShadowUnit = null
		}
	},
}

export default IncomingResolveStackMessages
