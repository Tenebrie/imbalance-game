import BundleCardBuffMessage from '@shared/models/network/groupWrappers/BundleCardBuffMessage'
import BundleLoopMessage from '@shared/models/network/groupWrappers/BundleLoopMessage'
import BundleNextThreadMessage from '@shared/models/network/groupWrappers/BundleNextThreadMessage'
import { BundleMessageHandlers, BundleMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'

export const IncomingGroupMessages: BundleMessageHandlers = {
	[BundleMessageType.THREAD_NEXT]: (data) => {
		return BundleNextThreadMessage.unwrap(data)
	},
	[BundleMessageType.CARD_BUFF]: (data) => {
		return BundleCardBuffMessage.unwrap(data)
	},
	[BundleMessageType.GENERIC_LOOP]: (data) => {
		return BundleLoopMessage.unwrap(data)
	},
}
