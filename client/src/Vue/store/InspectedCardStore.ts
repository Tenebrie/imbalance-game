import CardMessage from '@shared/models/network/card/CardMessage'
import OpenCardMessage from '@shared/models/network/card/OpenCardMessage'
import { createDirectStore, defineModule } from 'direct-vuex'

import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'
import globalStore from '@/Vue/store'

const { store, rootActionContext } = createDirectStore({
	modules: {
		_: defineModule({}),
	},

	state: {
		stack: [] as CardMessage[],
		lastCard: null as CardMessage | null,
	},

	mutations: {
		pushToStack(state, inspectedCard: CardMessage): void {
			state.stack.push(inspectedCard)
		},

		popFromStack(state): void {
			state.stack.pop()
		},

		clearStack(state): void {
			state.stack = []
		},

		setLastCard(state, card: CardMessage | null): void {
			state.lastCard = card
		},
	},

	getters: {
		card: (state): CardMessage | null => {
			if (state.stack.length === 0) {
				return null
			}
			return state.stack[state.stack.length - 1]
		},

		lastCard: (state): CardMessage | null => {
			return state.lastCard
		},
	},

	actions: {
		setCard(context, payload: { card: RenderedCard } | { message: CardMessage }): void {
			const { state, commit } = rootActionContext(context)

			const message = 'message' in payload ? payload.message : new OpenCardMessage(payload.card)
			if (state.stack.length > 0 && message.id === state.stack[state.stack.length - 1].id) {
				return
			}

			if (state.stack.some((card) => card.id === message.id)) {
				while (state.stack[state.stack.length - 1].id !== message.id) {
					commit.popFromStack()
				}
				return
			}
			commit.pushToStack(message)
			commit.setLastCard(message)
		},

		undoCard(context): void {
			const { state, commit, getters } = rootActionContext(context)
			commit.popFromStack()
			if (state.stack.length > 0) {
				commit.setLastCard(getters.card)
			}
			if (state.stack.length === 0 && globalStore.getters.gameStateModule.isInGame && Core.input) {
				Core.input.restoreMousePosition()
			}
		},

		clear(context): void {
			const { commit } = rootActionContext(context)
			commit.clearStack()
			Core.input && Core.input.releaseInspectedCard()
		},
	},
})

export default store
