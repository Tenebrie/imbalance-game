import { ServerToClientWebJson, WebMessageTypeMapping } from '@shared/models/network/messageHandlers/WebMessageTypes'
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
		globalWebSocketState: 'disconnected' as 'connected' | 'connecting' | 'disconnected',
	},

	mutations: {
		setGlobalWebSocketState(state, socketState: 'connected' | 'connecting' | 'disconnected'): void {
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

		async keepGlobalWebSocketAlive(context): Promise<void> {
			const { state, dispatch, rootState } = moduleActionContext(context, GlobalSocketModule)

			let connectionWasEstablished = false
			let connectionLostNotification: NotificationWrapper | null = null

			window.setInterval(() => {
				if (!rootState.isLoggedIn || state.globalWebSocketState === 'connecting') {
					return
				}
				if (!connectionWasEstablished && state.globalWebSocketState === 'connected') {
					connectionWasEstablished = true
				}

				if (state.globalWebSocketState === 'disconnected' && connectionWasEstablished) {
					console.info('[Global Socket] Trying to reconnect')
					dispatch.connectGlobalWebSocket()
					if (!connectionLostNotification) {
						connectionLostNotification = Notifications.connectionLost('Server connection lost')
					}
				} else if (state.globalWebSocketState === 'connected' && connectionLostNotification) {
					Notifications.success('Server Connection Restored!')
					connectionLostNotification.discard()
					connectionLostNotification = null
				}
			}, 1000)

			window.setInterval(() => {
				if (state.globalWebSocket && state.globalWebSocketState === 'connected') {
					state.globalWebSocket.send('keepalive')
				}
			}, 30000)
		},
	},
})

export default GlobalSocketModule
