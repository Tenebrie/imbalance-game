import {defineModule} from 'direct-vuex'
import * as PIXI from 'pixi.js'
import Card from '@shared/models/Card'
import store, {moduleActionContext} from '@/Vue/store'
import CardMessage from '@shared/models/network/card/CardMessage'

const HoveredDeckCardModule = defineModule({
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
			const { commit } = moduleActionContext(context, HoveredDeckCardModule)
			commit.setCard(payload.card)
			commit.setPosition(payload.position)
			commit.setScrollCallback(payload.scrollCallback)
		}
	}
})

export default HoveredDeckCardModule
