import store from '@/Vue/store'
import Input from '@/Pixi/Input'
import Renderer from '@/Pixi/Renderer'
import Player from '@/shared/models/Player'
import GameBoard from '@/shared/models/GameBoard'
import PlayerInGame from '@/shared/models/PlayerInGame'
import IncomingMessageHandlers from '@/Pixi/IncomingMessageHandlers'
import OutgoingMessageHandlers from '@/Pixi/OutgoingMessageHandlers'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'

export default class Core {
	public static input: Input
	public static renderer: Renderer
	public static socket: WebSocket
	public static keepaliveTimer: number

	public static gameBoard: GameBoard
	public static player: ClientPlayerInGame
	public static opponent: ClientPlayerInGame

	public static init(gameId: string, container: Element): void {
		const socket = new WebSocket(`ws://${window.location.host}/game/${gameId}`)
		socket.onopen = () => this.onConnect(container)
		socket.onmessage = (event) => this.onMessage(event)
		socket.onclose = (event) => this.onDisconnect(event)
		socket.onerror = (event) => this.onError(event)
		Core.socket = socket

		Core.player = ClientPlayerInGame.fromPlayer(store.getters.player)
	}

	private static onConnect(container: Element): void {
		Core.renderer = new Renderer(container)
		Core.keepaliveTimer = setInterval(() => {
			OutgoingMessageHandlers.sendKeepalive()
		}, 30000)

		Core.input = new Input()

		OutgoingMessageHandlers.getChat()
		OutgoingMessageHandlers.getOpponent()
		OutgoingMessageHandlers.getBoardState()
	}

	private static onMessage(event: MessageEvent): void {
		const data = JSON.parse(event.data)
		const messageType = data.type as string
		const messageData = data.data as any

		const handler = IncomingMessageHandlers[messageType]
		if (!handler) {
			console.error('Unknown message type: ' + messageType)
			return
		}

		handler(messageData)
	}

	private static onDisconnect(event: CloseEvent): void {
		if (!event.wasClean) {
			console.error(`Connection closed. Reason: ${event.reason}`)
		}
		clearInterval(Core.keepaliveTimer)
	}

	private static onError(event: Event): void {
		console.error('Unknown error occurred', event)
	}

	public static registerOpponent(opponent: ClientPlayerInGame): void {
		Core.opponent = opponent
	}

	public static sendMessage(type: string, data: any): void {
		Core.socket.send(JSON.stringify({
			type: type,
			data: data
		}))
	}

	public static reset(): void {
		this.socket.close()
	}
}
