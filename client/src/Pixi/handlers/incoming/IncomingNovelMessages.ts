import { IncomingMessageHandlerFunction } from '@/Pixi/handlers/IncomingMessageHandlers'
import store from '@/Vue/store'
import StoryCharacter from '@shared/enums/StoryCharacter'
import { NovelMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import NovelCueMessage from '@shared/models/novel/NovelCueMessage'
import NovelReplyMessage from '@shared/models/novel/NovelReplyMessage'

const IncomingNovelMessages: { [index in NovelMessageType]: IncomingMessageHandlerFunction } = {
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
	[NovelMessageType.REMOVE_CHARACTER]: (character: StoryCharacter) => {
		// Empty
	},
	[NovelMessageType.FINISH]: () => {
		// Empty
	},
}

export default IncomingNovelMessages
