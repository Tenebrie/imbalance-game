import { ServerToClientGlobalMessage, WebMessageTypeMapping } from '@shared/models/network/messageHandlers/WebMessageTypes'
import { compressGameTraffic } from '@shared/Utils'
import { defineModule } from 'direct-vuex'
import lzutf8 from 'lzutf8'

import { IncomingGlobalMessages } from '@/Pixi/handlers/incoming/IncomingGlobalMessages'
import Notifications from '@/utils/Notifications'
import { electronWebsocketTarget, isElectron } from '@/utils/Utils'
import { moduleActionContext } from '@/Vue/store'
import { NotificationWrapper } from '@/Vue/store/modules/NotificationModule'

const GlobalSocketModule = defineModule({
	namespaced: true,
	state: {
		globalWebSocket: null as WebSocket | null,
		globalWebSocketState: 'disconnected' as 'established' | 'connected' | 'connecting' | 'disconnected',
	},

	mutations: {
		setGlobalWebSocketState(state, socketState: 'established' | 'connected' | 'connecting' | 'disconnected'): void {
			state.globalWebSocketState = socketState
		},

		setGlobalWebSocket(state, socket: WebSocket | null): void {
			state.globalWebSocket = socket
		},
	},

	actions: {
		async connectGlobalWebSocket(context): Promise<void> {
			const { state, commit } = moduleActionContext(context, GlobalSocketModule)
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
				const parsedData = JSON.parse(data) as ServerToClientGlobalMessage
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

		async keepGlobalWebSocketAlive(context): Promise<void> {
			const { state, dispatch, rootState, rootDispatch } = moduleActionContext(context, GlobalSocketModule)

			let connectionWasEstablished = false
			let connectionLostNotification: NotificationWrapper | null = null
			let reconnectAttempts = 0

			window.setInterval(() => {
				if (!rootState.isLoggedIn || state.globalWebSocketState === 'connecting') {
					return
				}
				if (!connectionWasEstablished && state.globalWebSocketState === 'established') {
					connectionWasEstablished = true
				}

				if (state.globalWebSocketState === 'disconnected') {
					console.info('[Global Socket] Trying to reconnect')
					dispatch.connectGlobalWebSocket()
					if (!connectionLostNotification && connectionWasEstablished) {
						connectionLostNotification = Notifications.connectionLost('Server connection lost')
					}
					reconnectAttempts += 1
					if (!connectionLostNotification && reconnectAttempts >= 3) {
						connectionLostNotification = Notifications.connectionLost('Unable to connect to server')
					}
				} else if (state.globalWebSocketState === 'established' && connectionLostNotification) {
					Notifications.success('Server Connection Restored!')
					connectionLostNotification.discard()
					connectionLostNotification = null
					reconnectAttempts = 0
					rootDispatch.editor.forceReloadCardLibrary()
				}
			}, 1000)

			window.setInterval(() => {
				if (state.globalWebSocket && state.globalWebSocketState === 'established') {
					state.globalWebSocket.send('keepalive')
				}
			}, 30000)
		},
	},
})

export default GlobalSocketModule
