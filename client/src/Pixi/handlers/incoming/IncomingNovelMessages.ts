import StoryCharacter from '@shared/enums/StoryCharacter'
import { NovelMessageHandlers, NovelMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import NovelCueMessage from '@shared/models/novel/NovelCueMessage'
import NovelReplyMessage from '@shared/models/novel/NovelReplyMessage'

import store from '@/Vue/store'

const IncomingNovelMessages: NovelMessageHandlers = {
	[NovelMessageType.START]: () => {
		// Empty
	},
	[NovelMessageType.SAY]: (cue: NovelCueMessage) => {
		store.dispatch.novel.addToQueue({ type: 'cue', cue })
	},
	[NovelMessageType.CLEAR]: () => {
		store.dispatch.novel.clear()
	},
	[NovelMessageType.ADD_REPLY]: (reply: NovelReplyMessage) => {
		store.dispatch.novel.addReply({ reply })
	},
	[NovelMessageType.ADD_CHARACTER]: () => {
		// Empty
	},
	[NovelMessageType.ACTIVATE_CHARACTER]: (character: StoryCharacter | null) => {
		store.dispatch.novel.addToQueue({ type: 'character_active', character })
	},
	[NovelMessageType.REMOVE_CHARACTER]: () => {
		// Empty
	},
	[NovelMessageType.FINISH]: () => {
		// Empty
	},
}

export default IncomingNovelMessages
