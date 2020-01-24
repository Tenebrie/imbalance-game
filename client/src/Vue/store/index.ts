import Vue from 'vue'
import Vuex from 'vuex'
import Player from '@/Pixi/shared/models/Player'
import { createDirectStore, createModule } from 'direct-vuex'
import Core from '@/Pixi/Core'

Vue.use(Vuex)

const gameStateModule = createModule({
	namespaced: true,
	state: {
		isGameStarted: false as boolean,
		isPlayersTurn: false as boolean
	},

	mutations: {
		setIsGameStarted(state, isGameStarted: boolean): void {
			state.isGameStarted = isGameStarted
		},

		setIsPlayersTurn(state, isPlayersTurn: boolean): void {
			state.isPlayersTurn = isPlayersTurn
		}
	},

	actions: {
		startGame(context): void {
			const { commit } = moduleActionContext(context, gameStateModule)
			commit.setIsGameStarted(true)
		},

		reset(context): void {
			const { commit } = moduleActionContext(context, gameStateModule)
			commit.setIsGameStarted(false)
			commit.setIsPlayersTurn(false)
		}
	}
})

const { store, rootActionContext, moduleActionContext } = createDirectStore({
	modules: {
		gameStateModule: gameStateModule
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

		setSelectedGameId(state, gameId: string): void {
			state.selectedGameId = gameId
		},

		resetSelectedGameId(state): void {
			state.selectedGameId = ''
		}
	},

	getters: {
		player: (state): Player => {
			if (!state.player) {
				throw new Error('Player is not available!')
			}
			return state.player
		}
	},

	actions: {
		leaveGame(): void {
			Core.socket.close(1000, 'Player disconnect')
		},

		onSocketClosed(): void {
			store.commit.resetSelectedGameId()
			store.dispatch.gameStateModule.reset()
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
