import StoryCharacter from '@shared/enums/StoryCharacter'
import { NovelMessageHandlers, NovelMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import NovelCueMessage from '@shared/models/novel/NovelCueMessage'
import NovelMoveAction from '@shared/models/novel/NovelMoveAction'
import NovelResponseMessage from '@shared/models/novel/NovelResponseMessage'

import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import store from '@/Vue/store'

const IncomingNovelMessages: NovelMessageHandlers = {
	[NovelMessageType.START]: () => {
		store.dispatch.novel.clear()
	},
	[NovelMessageType.SAY]: (cue: NovelCueMessage) => {
		store.commit.novel.setCue(cue)
		store.dispatch.novel.startPrintTimer()
	},
	[NovelMessageType.MOVE]: (action: NovelMoveAction) => {
		OutgoingMessageHandlers.sendNovelChapterMove(action.chapterId)
	},
	[NovelMessageType.CLEAR]: () => {
		store.dispatch.novel.clear()
	},
	[NovelMessageType.ADD_REPLY]: (response: NovelResponseMessage) => {
		store.dispatch.novel.addResponse({ response })
	},
	[NovelMessageType.ADD_CHARACTER]: () => {
		// Empty
	},
	[NovelMessageType.ACTIVATE_CHARACTER]: (character: StoryCharacter | null) => {
		store.commit.novel.setActiveCharacter(character)
	},
	[NovelMessageType.REMOVE_CHARACTER]: () => {
		// Empty
	},
	[NovelMessageType.CONTINUE]: () => {
		OutgoingMessageHandlers.sendNovelContinue()
	},
	[NovelMessageType.END]: () => {
		store.dispatch.novel.clear()
	},
}

export default IncomingNovelMessages
