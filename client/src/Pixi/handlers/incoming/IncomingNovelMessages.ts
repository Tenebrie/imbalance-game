import StoryCharacter from '@shared/enums/StoryCharacter'
import { NovelMessageHandlers, NovelMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import NovelCueMessage from '@shared/models/novel/NovelCueMessage'
import NovelMoveAction from '@shared/models/novel/NovelMoveAction'
import NovelResponseMessage from '@shared/models/novel/NovelResponseMessage'

import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import store from '@/Vue/store'

const IncomingNovelMessages: NovelMessageHandlers = {
	[NovelMessageType.START]: () => {
		store.dispatch.novel.fullClear()
		store.commit.novel.setIsActive(true)
	},
	[NovelMessageType.SAY]: (cue: NovelCueMessage) => {
		store.dispatch.novel.setCue({ cue })
		store.dispatch.novel.startPrintTimer()
	},
	[NovelMessageType.MOVE]: (action: NovelMoveAction) => {
		OutgoingMessageHandlers.sendNovelChapterMove(action.chapterId)
	},
	[NovelMessageType.CLEAR]: () => {
		store.dispatch.novel.clearResponses()
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
		store.commit.novel.setIsActive(false)
	},
	[NovelMessageType.MUTE]: () => {
		store.commit.novel.setIsMuted(true)
	},
	[NovelMessageType.SKIP_CUE_ANIMATION]: () => {
		store.dispatch.novel.skipCurrentCueAnimation()
	},
	[NovelMessageType.NEXT_CUE]: () => {
		store.dispatch.novel.proceedToNextCue()
	},
}

export default IncomingNovelMessages
