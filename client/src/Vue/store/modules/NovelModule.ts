import StoryCharacter from '@shared/enums/StoryCharacter'
import NovelCue from '@shared/models/novel/NovelCue'
import NovelCueMessage from '@shared/models/novel/NovelCueMessage'
import NovelResponseMessage from '@shared/models/novel/NovelResponseMessage'
import { defineModule } from 'direct-vuex'

import Core from '@/Pixi/Core'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import { moduleActionContext } from '@/Vue/store'

const novelModule = defineModule({
	namespaced: true,

	state: {
		isActive: false as boolean,
		isMuted: false as boolean,
		cue: null as NovelCue | null,
		responses: [] as NovelResponseMessage[],
		activeCharacter: null as StoryCharacter | null,
		printTimer: null as number | null,
		charactersPrinted: 0 as number,
		decayingCues: [] as NovelCue[],
		decayingResponses: [] as (NovelResponseMessage & { isSelected: boolean })[],
	},

	mutations: {
		setIsActive(state, value: boolean): void {
			state.isActive = value
		},

		setIsMuted(state, value: boolean): void {
			state.isMuted = value
		},

		setCue(state, value: NovelCue | null): void {
			state.cue = value
		},

		addResponse(state, value: NovelResponseMessage): void {
			state.responses.push(value)
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
			state.activeCharacter = null
			state.responses = []
		},

		clearResponses(state): void {
			state.responses = []
		},

		addDecayingCue(state, cue: NovelCue): void {
			state.decayingCues.push(cue)
		},

		removeDecayingCue(state, id: string): void {
			state.decayingCues = state.decayingCues.filter((cue) => cue.id !== id)
		},

		addDecayingResponses(state, responses: (NovelResponseMessage & { isSelected: boolean })[]): void {
			responses.forEach((response) => state.decayingResponses.push(response))
		},

		removeDecayingResponses(state, IDs: string[]): void {
			state.decayingResponses = state.decayingResponses.filter((response) => !IDs.includes(response.chapterId))
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

		currentResponses: (state): NovelResponseMessage[] => {
			return state.responses
		},
	},

	actions: {
		setCue(context, args: { cue: NovelCueMessage }): void {
			const { commit, dispatch } = moduleActionContext(context, novelModule)

			dispatch.decayCurrentCue()

			commit.setIsMuted(false)
			commit.setCue(args.cue)
		},

		addResponse(context, args: { response: NovelResponseMessage }): void {
			const { commit } = moduleActionContext(context, novelModule)

			commit.setIsMuted(false)
			commit.addResponse(args.response)
		},

		reply(context, args: { response: NovelResponseMessage }): void {
			const { state, commit, rootState } = moduleActionContext(context, novelModule)

			if (rootState.gameStateModule.isSpectating) {
				return
			}

			commit.addDecayingResponses(
				state.responses.map((response) => ({
					...response,
					isSelected: response.chapterId === args.response.chapterId,
				}))
			)
			const responseIDs = state.responses.map((response) => response.chapterId)
			setTimeout(() => {
				commit.removeDecayingResponses(responseIDs)
			}, 1000)

			commit.clearResponses()

			Core.mainHandler.currentOpenAnimationThread.skipCooldown()
			OutgoingMessageHandlers.sendNovelChapterMove(args.response.chapterId)
		},

		setActiveCharacter(context, args: { character: StoryCharacter | null }): void {
			const { commit } = moduleActionContext(context, novelModule)
			commit.setIsMuted(false)
			commit.setActiveCharacter(args.character)
		},

		continue(context): void {
			const { state, getters, dispatch, rootState } = moduleActionContext(context, novelModule)
			if (getters.currentCue && getters.currentCueText.length < getters.currentCue?.text.length) {
				dispatch.skipCurrentCueAnimation()
				OutgoingMessageHandlers.sendNovelSkipAnimation()
			} else if (state.cue && state.responses.length === 0 && !rootState.gameStateModule.isSpectating) {
				dispatch.proceedToNextCue()
				OutgoingMessageHandlers.sendNovelNextCue()
			}
		},

		skipCurrentCueAnimation(context): void {
			const { commit, getters, dispatch } = moduleActionContext(context, novelModule)
			if (getters.currentCue && getters.currentCueText.length < getters.currentCue?.text.length) {
				commit.setCharactersPrinted(getters.currentCue.text.length)
			}
			dispatch.stopPrintTimer()
		},

		proceedToNextCue(context): void {
			const { state } = moduleActionContext(context, novelModule)

			if (!state.cue || state.responses.length > 0) {
				return
			}

			Core.mainHandler.currentOpenAnimationThread.skipCooldown()
		},

		decayCurrentCue(context): void {
			const { state, commit } = moduleActionContext(context, novelModule)

			if (!state.cue) {
				return
			}

			commit.addDecayingCue(state.cue)
			const id = state.cue.id

			setTimeout(() => {
				commit.removeDecayingCue(id)
			}, 1000)

			commit.setCue(null)
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

		clearResponses(context): void {
			const { state, commit } = moduleActionContext(context, novelModule)
			const toResetCooldown = !!state.cue || state.responses.length > 0
			commit.clearResponses()
			if (toResetCooldown) {
				Core.mainHandler.currentOpenAnimationThread.skipCooldown()
			}
		},

		fullClear(context): void {
			const { commit, dispatch } = moduleActionContext(context, novelModule)
			dispatch.clearResponses()
			commit.clear()
		},
	},
})

export default novelModule
