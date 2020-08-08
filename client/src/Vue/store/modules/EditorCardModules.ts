import {createModule} from 'direct-vuex'
import * as PIXI from 'pixi.js'
import Card from '@shared/models/Card'
import store, {moduleActionContext} from '@/Vue/store'

export const inspectedCardModule = createModule({
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
		card: (state): Card | null => {
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
			const { commit } = moduleActionContext(context, inspectedCardModule)
			commit.setCard(payload.card)
			commit.setPosition(payload.position)
			commit.setScrollCallback(payload.scrollCallback)
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
		card: (state): Card | null => {
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
