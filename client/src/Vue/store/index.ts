import Vue from 'vue'
import Vuex from 'vuex'
import Player from '@/Pixi/shared/models/Player'
import { createDirectStore, createModule } from 'direct-vuex'

Vue.use(Vuex)

const userInterfaceModule = createModule({
	state: {
		isPlayersTurn: false as boolean
	},

	mutations: {
		setIsPlayersTurn(state, isPlayersTurn: boolean): void {
			state.isPlayersTurn = isPlayersTurn
		}
	}
})

const { store, rootActionContext, moduleActionContext } = createDirectStore({
	modules: {
		userInterfaceModule
	},

	state: {
		player: null as Player | null,
		isLoggedIn: false as boolean,
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
