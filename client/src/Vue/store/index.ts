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
import PopupModule from '@/Vue/store/modules/PopupModule'
import GameLogModule from '@/Vue/store/modules/GameLogModule'
import InspectedCardModule from '@/Vue/store/modules/InspectedCardModule'
import LocalStorage from '@/utils/LocalStorage'
import {editorCardRenderer} from '@/utils/editor/EditorCardRenderer'
import GameMessage from '@shared/models/network/GameMessage'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'

Vue.use(Vuex)

const { store, rootActionContext, moduleActionContext } = createDirectStore({
	modules: {
		editor: EditorModule,
		gameLogModule: GameLogModule,
		gameStateModule: GameStateModule,
		popupModule: PopupModule,
		inspectedCard: InspectedCardModule,
		userPreferencesModule: UserPreferencesModule,
	},

	state: {
		player: null as Player | null,
		isLoggedIn: false as boolean,
		selectedGame: null as GameMessage | null,
		selectedDeckId: '' as string
	},

	mutations: {
		setPlayerData(state, player: Player): void {
			state.isLoggedIn = true
			state.player = player
		},

		setSelectedGame(state, selectedGame: GameMessage): void {
			state.selectedGame = selectedGame
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
		async fetchUser(context): Promise<void> {
			const { commit } = rootActionContext(context)

			const response = await axios.get('/api/user')
			const player = response.data.data as Player
			commit.setPlayerData(player)
		},

		async login(context, payload: { email: string, password: string }): Promise<void> {
			const { dispatch } = rootActionContext(context)

			await axios.post('/api/session', payload)
			await dispatch.postLogin()
		},

		async postLogin(context): Promise<void> {
			const {dispatch} = rootActionContext(context)

			LocalStorage.setHasAuthCookie(true)
			await dispatch.userPreferencesModule.fetchPreferences()
			await router.push({ name: 'home' })
			await store.dispatch.editor.loadCardLibrary()
			editorCardRenderer.startRenderingService()
		},

		async logout(context): Promise<void> {
			const { commit } = rootActionContext(context)
			const response = await axios.delete('/api/session')
			const stillAuthenticated = response.data['stillAuthenticated']
			LocalStorage.setHasAuthCookie(stillAuthenticated)
			commit.resetPlayerData()
			window.location.reload()
		},

		async deleteAccount(context): Promise<void> {
			const { commit } = rootActionContext(context)
			await axios.delete('/api/user')
			LocalStorage.setHasAuthCookie(false)
			commit.resetPlayerData()
			window.location.reload()
		},

		joinGame(context, selectedGame: GameMessage): void {
			const { commit } = rootActionContext(context)
			commit.setSelectedGame(selectedGame)
			router.push({ name: 'game' })
		},

		leaveGame(): void {
			if (store.state.gameStateModule.gameStatus === ClientGameStatus.NOT_STARTED) { return }

			OutgoingMessageHandlers.sendSurrender()
			store.dispatch.gameStateModule.reset()
			router.push({ name: 'home' })
			Core.socket.close(1000, 'Player disconnect')
			Core.cleanUp()
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
