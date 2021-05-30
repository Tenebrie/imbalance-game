import { defineModule } from 'direct-vuex'
import { moduleActionContext } from '@/Vue/store'
import NovelCueMessage from '@shared/models/novel/NovelCueMessage'
import NovelReplyMessage from '@shared/models/novel/NovelReplyMessage'
import StoryCharacter from '@shared/enums/StoryCharacter'

type NovelQueueEvent =
	| {
			type: 'cue'
			cue: NovelCueMessage
	  }
	| {
			type: 'character_active'
			character: StoryCharacter | null
	  }

const novelModule = defineModule({
	namespaced: true,

	state: {
		cues: [] as NovelQueueEvent[],
		replies: [] as NovelReplyMessage[],
		printTimer: null as number | null,
		activeCharacter: null as StoryCharacter | null,
		charactersPrinted: 0 as number,
	},

	mutations: {
		addCue(state, value: NovelQueueEvent): void {
			state.cues.push(value)
		},

		addReply(state, value: NovelReplyMessage): void {
			state.replies.push(value)
		},

		moveCues(state): void {
			state.cues.shift()
		},

		setPrintTimer(state, timer: number | null): void {
			state.printTimer = timer
		},

		setCharactersPrinted(state, count: number): void {
			state.charactersPrinted = count
		},

		setActiveCharacter(state, character: StoryCharacter | null): void {
			state.activeCharacter = character
		},

		clear(state): void {
			state.cues = []
			state.replies = []
			state.activeCharacter = null
		},
	},

	getters: {
		currentCue: (state): NovelCueMessage | null => {
			if (state.cues.length === 0 || state.cues[0].type !== 'cue') {
				return null
			}
			return state.cues[0].cue
		},

		currentEvent: (state): NovelQueueEvent | null => {
			if (state.cues.length === 0) {
				return null
			}
			return state.cues[0]
		},

		currentCueText: (state): string => {
			if (state.cues.length === 0 || state.cues[0].type !== 'cue') {
				return ''
			}
			return state.cues[0].cue.text.substring(0, Math.min(state.charactersPrinted, state.cues[0].cue.text.length))
		},

		currentReplies: (state): NovelReplyMessage[] => {
			if (state.cues.length !== 1) {
				return []
			}
			return state.replies
		},
	},

	actions: {
		addToQueue(context, event: NovelQueueEvent): void {
			const { state, commit, dispatch } = moduleActionContext(context, novelModule)

			if (state.cues.length === 0 && event.type === 'character_active') {
				dispatch.setActiveCharacter({ character: event.character })
				return
			}

			commit.addCue(event)
			dispatch.startPrintTimer()
		},

		addReply(context, args: { reply: NovelReplyMessage }): void {
			const { commit } = moduleActionContext(context, novelModule)

			commit.addReply(args.reply)
		},

		continue(context): void {
			const { state, commit, getters, dispatch } = moduleActionContext(context, novelModule)
			if (getters.currentCue && getters.currentCueText.length < getters.currentCue?.text.length) {
				commit.setCharactersPrinted(getters.currentCue.text.length)
				return
			}

			if (state.cues.length === 1 && state.replies.length === 0 && state.cues[0].type === 'cue') {
				commit.clear()
			} else if (state.cues.length > 1) {
				commit.moveCues()
				while (getters.currentEvent && getters.currentEvent.type !== 'cue') {
					if (getters.currentEvent.type === 'character_active') {
						dispatch.setActiveCharacter({ character: getters.currentEvent.character })
					}
					commit.moveCues()
				}
				dispatch.startPrintTimer()
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

		setActiveCharacter(context, args: { character: StoryCharacter | null }): void {
			const { commit } = moduleActionContext(context, novelModule)
			commit.setActiveCharacter(args.character)
		},

		clear(context): void {
			const { commit } = moduleActionContext(context, novelModule)
			commit.clear()
		},
	},
})

export default novelModule
