import StoryCharacter from '@shared/enums/StoryCharacter'
import NovelCue from '@shared/models/novel/NovelCue'
import NovelResponseMessage from '@shared/models/novel/NovelResponseMessage'
import { defineModule } from 'direct-vuex'

import Core from '@/Pixi/Core'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import { moduleActionContext } from '@/Vue/store'

const novelModule = defineModule({
	namespaced: true,

	state: {
		cue: null as NovelCue | null,
		replies: [] as NovelResponseMessage[],
		activeCharacter: null as StoryCharacter | null,
		printTimer: null as number | null,
		charactersPrinted: 0 as number,
	},

	mutations: {
		setCue(state, value: NovelCue | null): void {
			state.cue = value
		},

		addResponse(state, value: NovelResponseMessage): void {
			state.replies.push(value)
		},

		setActiveCharacter(state, character: StoryCharacter | null): void {
			state.activeCharacter = character
		},

		setPrintTimer(state, timer: number | null): void {
			state.printTimer = timer
		},

		setCharactersPrinted(state, count: number): void {
			state.charactersPrinted = count
		},

		clear(state): void {
			state.cue = null
			state.replies = []
			state.activeCharacter = null
		},

		clearResponses(state): void {
			state.replies = []
		},
	},

	getters: {
		currentCue: (state): NovelCue | null => {
			return state.cue
		},

		currentCueText: (state): string => {
			if (!state.cue) {
				return ''
			}
			return state.cue.text.substring(0, Math.min(state.charactersPrinted, state.cue.text.length))
		},

		currentReplies: (state): NovelResponseMessage[] => {
			return state.replies
		},
	},

	actions: {
		addResponse(context, args: { response: NovelResponseMessage }): void {
			const { commit } = moduleActionContext(context, novelModule)

			commit.addResponse(args.response)
		},

		reply(context, args: { response: NovelResponseMessage }): void {
			const { commit } = moduleActionContext(context, novelModule)
			commit.clearResponses()

			Core.mainHandler.currentOpenAnimationThread.skipCooldown()
			OutgoingMessageHandlers.sendNovelChapterMove(args.response.chapterId)
		},

		setActiveCharacter(context, args: { character: StoryCharacter | null }): void {
			const { commit } = moduleActionContext(context, novelModule)
			commit.setActiveCharacter(args.character)
		},

		continue(context): void {
			const { state, commit, getters, dispatch } = moduleActionContext(context, novelModule)
			if (getters.currentCue && getters.currentCueText.length < getters.currentCue?.text.length) {
				commit.setCharactersPrinted(getters.currentCue.text.length)
				dispatch.stopPrintTimer()
			} else if (state.cue && state.replies.length === 0) {
				Core.mainHandler.currentOpenAnimationThread.skipCooldown()
			}
		},

		startPrintTimer(context): void {
			const { commit, state, getters } = moduleActionContext(context, novelModule)
			commit.setCharactersPrinted(0)
			if (state.printTimer === null) {
				const timer = setInterval(() => {
					if (!getters.currentCue) {
						return
					}

					const cue = getters.currentCue.text
					let charactersPrinted = state.charactersPrinted + 1

					let nextCharacter: string | null = cue[charactersPrinted - 1]

					while (nextCharacter === '<' || nextCharacter === ' ' || nextCharacter === ',' || nextCharacter === '.') {
						if (nextCharacter === '<') {
							charactersPrinted += cue.indexOf('>', charactersPrinted) - charactersPrinted
						} else {
							charactersPrinted += 1
						}
						nextCharacter = cue[charactersPrinted - 1]
					}

					commit.setCharactersPrinted(charactersPrinted)
				}, 25)
				commit.setPrintTimer(timer)
			}
		},

		stopPrintTimer(context): void {
			const { commit, state } = moduleActionContext(context, novelModule)
			clearInterval(state.printTimer || undefined)
			commit.setPrintTimer(null)
		},

		clear(context): void {
			const { commit } = moduleActionContext(context, novelModule)
			commit.clear()
		},
	},
})

export default novelModule
