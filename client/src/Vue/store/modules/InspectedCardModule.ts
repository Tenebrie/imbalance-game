import CardMessage from '@shared/models/network/card/CardMessage'
import OpenCardMessage from '@shared/models/network/card/OpenCardMessage'
import { defineModule } from 'direct-vuex'

import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'
import { moduleActionContext } from '@/Vue/store'

const InspectedCardModule = defineModule({
	namespaced: true,

	state: {
		stack: [] as CardMessage[],
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
	},

	getters: {
		card: (state): CardMessage | null => {
			if (state.stack.length === 0) {
				return null
			}
			return state.stack[state.stack.length - 1]
		},
	},

	actions: {
		setCard(context, payload: { card: RenderedCard } | { message: CardMessage }): void {
			const { state, commit } = moduleActionContext(context, InspectedCardModule)

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
		},

		undoCard(context): void {
			const { state, commit } = moduleActionContext(context, InspectedCardModule)
			commit.popFromStack()
			if (state.stack.length === 0) {
				Core.input && Core.input.releaseInspectedCard()
			}
		},

		clear(context): void {
			const { commit } = moduleActionContext(context, InspectedCardModule)
			commit.clearStack()
			Core.input && Core.input.releaseInspectedCard()
		},
	},
})

export default InspectedCardModule
