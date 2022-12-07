import GameMessage from '@shared/models/network/GameMessage'
import Player from '@shared/models/Player'
import axios from 'axios'
import { createDirectStore } from 'direct-vuex'

import Core from '@/Pixi/Core'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import { editorCardRenderer } from '@/utils/editor/EditorCardRenderer'
import LocalStorage from '@/utils/LocalStorage'
import router from '@/Vue/router'
import EditorModule from '@/Vue/store/modules/EditorModule'
import GameLobbyModule from '@/Vue/store/modules/GameLobbyModule'
import GameLogModule from '@/Vue/store/modules/GameLogModule'
import GamesListModule from '@/Vue/store/modules/GamesListModule'
import GameStateModule from '@/Vue/store/modules/GameStateModule'
import GlobalSocketModule from '@/Vue/store/modules/GlobalSocketModule'
import HotkeysModule from '@/Vue/store/modules/HotkeysModule'
import NotificationModule from '@/Vue/store/modules/NotificationModule'
import PopupModule from '@/Vue/store/modules/PopupModule'
import UserPreferencesModule from '@/Vue/store/modules/UserPreferencesModule'

import NovelModule from './modules/NovelModule'
import RulesetsModule from './modules/RulesetsModule'

const { store, rootActionContext, moduleActionContext } = createDirectStore({
	modules: {
		editor: EditorModule,
		gameLogModule: GameLogModule,
		gameStateModule: GameStateModule,
		gamesListModule: GamesListModule,
		gameLobbyModule: GameLobbyModule,
		globalSocketModule: GlobalSocketModule,
		hotkeysModule: HotkeysModule,
		notifications: NotificationModule,
		novel: NovelModule,
		popupModule: PopupModule,
		rulesets: RulesetsModule,
		userPreferencesModule: UserPreferencesModule,
	},

	state: {
		player: null as Player | null,
		isLoggedIn: false as boolean,
		currentGame: null as GameMessage | null,
		nextLinkedGame: null as GameMessage | null,
		selectedDeckId: '' as string,
	},

	mutations: {
		setPlayerData(state, player: Player): void {
			state.isLoggedIn = true
			state.player = player
		},

		setCurrentGame(state, currentGame: GameMessage): void {
			state.currentGame = currentGame
		},

		setNextLinkedGame(state, linkedGame: GameMessage): void {
			state.nextLinkedGame = linkedGame
		},

		clearNextLinkedGame(state): void {
			state.nextLinkedGame = null
		},

		setSelectedDeckId(state, selectedDeckId: string): void {
			state.selectedDeckId = selectedDeckId
		},

		resetPlayerData(state): void {
			state.isLoggedIn = false
			state.player = null
		},
	},

	getters: {
		player: (state): Player => {
			if (!state.player) {
				throw new Error('Player is not available!')
			}
			return state.player
		},
	},

	actions: {
		async fetchUser(context): Promise<void> {
			const { commit } = rootActionContext(context)

			const response = await axios.get('/api/user')
			const player = response.data.data as Player
			commit.setPlayerData(player)
		},

		async login(context, payload: { email: string; password: string }): Promise<void> {
			const { dispatch } = rootActionContext(context)

			await axios.post('/api/session', payload)
			await dispatch.postLogin()
		},

		async guestLogin(context): Promise<void> {
			const { dispatch } = rootActionContext(context)

			await axios.post('/api/session/guest')
			await dispatch.postLogin()
		},

		async postLogin(context): Promise<void> {
			const { dispatch } = rootActionContext(context)

			LocalStorage.setHasAuthCookie(true)
			await dispatch.userPreferencesModule.fetchPreferences()
			await router.push({ name: 'home' })
			await store.dispatch.rulesets.loadLibrary()
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
			store.dispatch.novel.fullClear()
			commit.setCurrentGame(selectedGame)
			router.push({ name: 'game' })
		},

		async leaveGame(): Promise<void> {
			store.dispatch.gameStateModule.reset()
			store.dispatch.popupModule.closeAll()
			store.dispatch.novel.fullClear()
			await router.push({ name: 'home' })
			if (Core.socket && Core.socket.readyState === WebSocket.OPEN) {
				Core.socket.close(1000, 'Player disconnect')
			}
			Core.cleanUp()
		},

		async surrenderGame(context): Promise<void> {
			const { commit, dispatch } = rootActionContext(context)

			OutgoingMessageHandlers.sendSurrender()
			await dispatch.leaveGame()
			commit.clearNextLinkedGame()
		},

		async leaveAndContinue(context): Promise<void> {
			const { state, commit, dispatch } = rootActionContext(context)

			await dispatch.leaveGame()
			if (state.nextLinkedGame) {
				dispatch.joinGame(state.nextLinkedGame)
				commit.clearNextLinkedGame()
			}
		},
	},
})

// Export the direct-store instead of the classic Vuex store.
export default store

// The following exports will be used to enable types in the
// implementation of actions.
export { moduleActionContext, rootActionContext }

// The following lines enable types in the injected store '$store'.
export type AppStore = typeof store
declare module 'vuex' {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface Store<S> {
		direct: AppStore
	}
}
