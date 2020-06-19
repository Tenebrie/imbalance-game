import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import Core from '@/Pixi/Core'
import router from '@/Vue/router'
import Player from '@shared/models/Player'
import ClientGameStatus from '@/Pixi/enums/ClientGameStatus'
import { createDirectStore } from 'direct-vuex'
import EditorModule from '@/Vue/store/modules/EditorModule'
import GameStateModule from '@/Vue/store/modules/GameStateModule'
import UserPreferencesModule from '@/Vue/store/modules/UserPreferencesModule'

Vue.use(Vuex)

const { store, rootActionContext, moduleActionContext } = createDirectStore({
	modules: {
		editor: EditorModule,
		gameStateModule: GameStateModule,
		userPreferencesModule: UserPreferencesModule
	},

	state: {
		player: null as Player | null,
		isLoggedIn: false as boolean,
		selectedGameId: '' as string,
		selectedDeckId: '' as string
	},

	mutations: {
		setPlayerData(state, player: Player): void {
			state.isLoggedIn = true
			state.player = player
		},

		setSelectedGameId(state, selectedGameId: string): void {
			state.selectedGameId = selectedGameId
		},

		setSelectedDeckId(state, selectedDeckId: string): void {
			state.selectedDeckId = selectedDeckId
		},

		resetPlayerData(state): void {
			state.isLoggedIn = false
			state.player = null
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
		async logout(context): Promise<void> {
			const { commit } = rootActionContext(context)
			await axios.delete('/api/session')
			commit.resetPlayerData()
			await router.push({ name: 'login' })
		},

		joinGame(context, selectedGameId: string): void {
			const { commit } = rootActionContext(context)
			commit.setSelectedGameId(selectedGameId)
			router.push({ name: 'game' })
		},

		leaveGame(): void {
			if (store.state.gameStateModule.gameStatus === ClientGameStatus.NOT_STARTED) { return }

			store.dispatch.gameStateModule.reset()
			router.push({ name: 'home' })
			Core.socket.close(1000, 'Player disconnect')
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
