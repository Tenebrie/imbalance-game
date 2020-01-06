import Vue from 'vue'
import Vuex from 'vuex'
import Player from '@/shared/models/Player'
import { createDirectStore } from 'direct-vuex'

Vue.use(Vuex)

const { store, rootActionContext, moduleActionContext } = createDirectStore({
	state: {
		isLoggedIn: false as boolean,
		player: null as Player | null,
		selectedGameId: '' as string
	},

	mutations: {
		setPlayerData(state, { player }: { player: Player}): void {
			state.isLoggedIn = true
			state.player = player
		},

		resetPlayerData(state): void {
			state.isLoggedIn = false
			state.player = null
		},

		setSelectedGameId(state, gameId): void {
			state.selectedGameId = gameId
		}
	},

	getters: {
		player: (state): Player => {
			if (!state.player) {
				throw new Error('Player is not available!')
			}
			return state.player
		}
	}
})

// Export the direct-store instead of the classic Vuex store.
export default store

// The following exports will be used to enable types in the
// implementation of actions.
export { rootActionContext, moduleActionContext }

// The following lines enable types in the injected store '$store'.
export type AppStore = typeof store
declare module 'vuex' {
	interface Store<S> {
		direct: AppStore
	}
}
