import { GroupMessageHandlers, GroupMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'

export const IncomingGroupMessages: GroupMessageHandlers = {
	[GroupMessageType.THREAD_NEXT]: (data) => {
		// TODO: Implement!
	},
}
