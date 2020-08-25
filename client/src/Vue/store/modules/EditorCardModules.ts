import {createModule} from 'direct-vuex'
import * as PIXI from 'pixi.js'
import Card from '@shared/models/Card'
import store, {moduleActionContext} from '@/Vue/store'
import Core from '@/Pixi/Core'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardMessage from '@shared/models/network/CardMessage'

export const inspectedCardModule = createModule({
	namespaced: true,

	state: {
		stack: [] as string[]
	},

	mutations: {
		pushToStack(state, inspectedCard: Card): void {
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
			return (Core.game && Core.game.findRenderedCardById(id)) || store.state.editor.cardLibrary.find(card => card.id === id) || null
		},
	},

	actions: {
		setCard(context, payload: { card: Card }): void {
			const { state, commit } = moduleActionContext(context, inspectedCardModule)
			if (state.stack.length >= 8 || (state.stack.length > 0 && payload.card.id === state.stack[state.stack.length - 1])) {
				return
			}

			commit.pushToStack(payload.card)
		},

		undoCard(context): void {
			const { state, commit } = moduleActionContext(context, inspectedCardModule)
			commit.popFromStack()
			if (state.stack.length === 0) {
				Core.input && Core.input.releaseInspectedCard()
			}
		},

		clear(context): void {
			const { commit } = moduleActionContext(context, inspectedCardModule)
			commit.clearStack()
			Core.input && Core.input.releaseInspectedCard()
		}
	}
})

export const hoveredDeckCardModule = createModule({
	namespaced: true,
	mutations: {
		setCard(state, inspectedCard: Card | null): void {
			state.class = inspectedCard ? inspectedCard.class : null
		},

		setPosition(state, position: PIXI.Point): void {
			state.position = position
		},

		setScrollCallback(state, scrollCallback: () => void): void {
			state.scrollCallback = scrollCallback
		},
	},

	getters: {
		card: (state): CardMessage | null => {
			return store.state.editor.cardLibrary.find(card => card.class === state.class) || null
		},
	},

	state: {
		class: null as string | null,
		position: new PIXI.Point(0, 0) as PIXI.Point,
		scrollCallback: null as (() => void) | null,
	},

	actions: {
		setCard(context, payload: { card: Card, position: PIXI.Point, scrollCallback: () => void }): void {
			const { commit } = moduleActionContext(context, hoveredDeckCardModule)
			commit.setCard(payload.card)
			commit.setPosition(payload.position)
			commit.setScrollCallback(payload.scrollCallback)
		}
	}
})
