import * as PIXI from 'pixi.js'
import store from '@/Vue/store'
import Input from '@/Pixi/Input'
import Renderer from '@/Pixi/Renderer'
import MainHandler from '@/Pixi/MainHandler'
import ClientGame from '@/Pixi/models/ClientGame'
import RenderedCard from '@/Pixi/models/RenderedCard'
import RenderedGameBoard from '@/Pixi/models/RenderedGameBoard'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import IncomingMessageHandlers from '@/Pixi/handlers/IncomingMessageHandlers'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import RenderedButton from '@/Pixi/models/RenderedButton'
import UserInterface from '@/Pixi/UserInterface'

export default class Core {
	public static input: Input
	public static socket: WebSocket
	public static renderer: Renderer
	public static mainHandler: MainHandler
	public static userInterface: UserInterface
	public static keepaliveTimer: number

	public static game: ClientGame
	public static board: RenderedGameBoard
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

		Core.game = new ClientGame()
		Core.input = new Input()
		Core.board = new RenderedGameBoard()
		Core.mainHandler = MainHandler.start()
		Core.userInterface = new UserInterface()

		const endTurnButton = new RenderedButton(new PIXI.Point(this.renderer.pixi.view.width - 100, this.renderer.pixi.view.height / 2), () => {
			OutgoingMessageHandlers.sendEndTurn()
		})
		this.registerButton(endTurnButton)
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
		Core.input.clear()
		Core.mainHandler.stop()
		Core.renderer.destroy()
	}

	private static onError(event: Event): void {
		console.error('Unknown error occurred', event)
	}

	public static registerOpponent(opponent: ClientPlayerInGame): void {
		Core.opponent = opponent
	}

	public static getPlayer(playerId: string): ClientPlayerInGame {
		if (this.player && this.player.player.id === playerId) {
			return this.player
		} else if (this.opponent && this.opponent.player.id === playerId) {
			return this.opponent
		}
		throw new Error(`Player ${playerId} does not exist!`)
	}

	public static sendMessage(type: string, data: any): void {
		Core.socket.send(JSON.stringify({
			type: type,
			data: data
		}))
	}

	public static registerButton(renderedButton: RenderedButton): void {
		Core.renderer.registerButton(renderedButton)
		Core.userInterface.registerButton(renderedButton)
	}

	public static unregisterButton(renderedButton: RenderedButton): void {
		Core.renderer.unregisterButton(renderedButton)
		Core.userInterface.unregisterButton(renderedButton)
	}

	public static registerCard(renderedCard: RenderedCard): void {
		Core.renderer.registerCard(renderedCard)
		Core.mainHandler.registerCard(renderedCard)
	}

	public static unregisterCard(renderedCard: RenderedCard): void {
		Core.renderer.unregisterCard(renderedCard)
		Core.mainHandler.unregisterCard(renderedCard)
	}

	public static reset(): void {
		if (!this.socket) { return }
		this.socket.close()
	}
}
