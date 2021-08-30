import GameMessage from '@shared/models/network/GameMessage'
import { ServerToClientWebJson, WebMessageTypeMapping } from '@shared/models/network/messageHandlers/WebMessageTypes'
import Player from '@shared/models/Player'
import { compressGameTraffic } from '@shared/Utils'
import axios from 'axios'
import { createDirectStore } from 'direct-vuex'
import lzutf8 from 'lzutf8'

import Core from '@/Pixi/Core'
import { IncomingGlobalMessages } from '@/Pixi/handlers/incoming/IncomingGlobalMessages'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import { editorCardRenderer } from '@/utils/editor/EditorCardRenderer'
import LocalStorage from '@/utils/LocalStorage'
import { electronWebsocketTarget, isElectron } from '@/utils/Utils'
import router from '@/Vue/router'
import EditorModule from '@/Vue/store/modules/EditorModule'
import GameLobbyModule from '@/Vue/store/modules/GameLobbyModule'
import GameLogModule from '@/Vue/store/modules/GameLogModule'
import GamesListModule from '@/Vue/store/modules/GamesListModule'
import GameStateModule from '@/Vue/store/modules/GameStateModule'
import HotkeysModule from '@/Vue/store/modules/HotkeysModule'
import InspectedCardModule from '@/Vue/store/modules/InspectedCardModule'
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
		hotkeysModule: HotkeysModule,
		inspectedCard: InspectedCardModule,
		novel: NovelModule,
		popupModule: PopupModule,
		rulesets: RulesetsModule,
		userPreferencesModule: UserPreferencesModule,
	},

	state: {
		globalWebSocket: null as WebSocket | null,
		globalWebSocketState: 'disconnected' as 'connected' | 'connecting' | 'disconnected',
		player: null as Player | null,
		isLoggedIn: false as boolean,
		currentGame: null as GameMessage | null,
		nextLinkedGame: null as GameMessage | null,
		selectedDeckId: '' as string,
	},

	mutations: {
		setGlobalWebSocketState(state, socketState: 'connected' | 'connecting' | 'disconnected'): void {
			state.globalWebSocketState = socketState
		},

		setGlobalWebSocket(state, socket: WebSocket | null): void {
			state.globalWebSocket = socket
		},

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
		async connectGlobalWebSocket(context): Promise<void> {
			const { state, commit, dispatch } = rootActionContext(context)
			if (state.globalWebSocketState === 'connecting') {
				dispatch.reconnectGlobalWebSocket()
			}
			if (state.globalWebSocket || state.globalWebSocketState !== 'disconnected') {
				return
			}

			const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
			const urlHost = isElectron() ? electronWebsocketTarget() : window.location.host
			const targetUrl = `${protocol}//${urlHost}/api/status`
			const connectedSocket = new WebSocket(targetUrl)
			connectedSocket.onopen = () => {
				commit.setGlobalWebSocket(connectedSocket)
				commit.setGlobalWebSocketState('connected')
			}
			connectedSocket.onmessage = (event) => onMessage(event, connectedSocket)
			connectedSocket.onclose = () => {
				commit.setGlobalWebSocket(null)
				commit.setGlobalWebSocketState('disconnected')
				dispatch.reconnectGlobalWebSocket()
			}
			connectedSocket.onerror = (event) => {
				console.error('Unknown error occurred', event)
			}
			commit.setGlobalWebSocketState('connecting')

			const onMessage = (event: MessageEvent, socket: WebSocket): void => {
				if (socket !== connectedSocket) {
					return
				}

				let data = event.data
				if (compressGameTraffic()) {
					data = lzutf8.decompress(event.data, {
						inputEncoding: 'BinaryString',
					})
				}
				const parsedData = JSON.parse(data) as ServerToClientWebJson
				const messageType = parsedData.type
				const messageData = parsedData.data

				const handler = IncomingGlobalMessages[messageType] as (data: WebMessageTypeMapping[typeof messageType]) => void
				if (!handler) {
					console.error(`Unknown global message type: ${messageType}`, messageData)
					return
				}

				try {
					handler(messageData)
				} catch (e) {
					console.error(e)
				}
			}
		},

		async reconnectGlobalWebSocket(context): Promise<void> {
			const { dispatch } = rootActionContext(context)

			setTimeout(() => {
				console.info('[Global Socket] Trying to reconnect')
				dispatch.connectGlobalWebSocket()
			}, 1000)
		},

		async keepGlobalWebSocketAlive(context): Promise<void> {
			const { state } = rootActionContext(context)

			window.setInterval(() => {
				if (state.globalWebSocket && state.globalWebSocketState === 'connected') {
					state.globalWebSocket.send('keepalive')
				}
			}, 30000)
		},

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
			await store.dispatch.editor.loadDecks()
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
			commit.setCurrentGame(selectedGame)
			router.push({ name: 'game' })
		},

		async leaveGame(): Promise<void> {
			store.dispatch.gameStateModule.reset()
			store.dispatch.popupModule.closeAll()
			store.dispatch.novel.clear()
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
