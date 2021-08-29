import Card from '@shared/models/Card'
import CardMessage from '@shared/models/network/card/CardMessage'
import { defineModule } from 'direct-vuex'

import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'
import store, { moduleActionContext } from '@/Vue/store'

const InspectedCardModule = defineModule({
	namespaced: true,

	state: {
		stack: [] as string[],
	},

	mutations: {
		pushToStack(state, inspectedCard: Card | CardMessage): void {
			state.stack.push(inspectedCard.id)
		},

		popFromStack(state): void {
			state.stack.pop()
		},

		clearStack(state): void {
			state.stack = []
		},
	},

	getters: {
		card: (state): RenderedCard | CardMessage | null => {
			if (state.stack.length === 0) {
				return null
			}
			const id = state.stack[state.stack.length - 1]
			return (Core.game && Core.game.findRenderedCardById(id)) || store.state.editor.cardLibrary.find((card) => card.id === id) || null
		},
	},

	actions: {
		setCard(context, payload: { card: Card | CardMessage }): void {
			const { state, commit } = moduleActionContext(context, InspectedCardModule)
			if (state.stack.length > 0 && payload.card.id === state.stack[state.stack.length - 1]) {
				return
			}

			if (state.stack.includes(payload.card.id)) {
				while (state.stack[state.stack.length - 1] !== payload.card.id) {
					commit.popFromStack()
				}
				return
			}

			commit.pushToStack(payload.card)
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
