import store from '@/Vue/store'
import Input from '@/Pixi/input/Input'
import Renderer from '@/Pixi/renderer/Renderer'
import MainHandler from '@/Pixi/MainHandler'
import ClientGame from '@/Pixi/models/ClientGame'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import RenderedGameBoard from '@/Pixi/cards/RenderedGameBoard'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import IncomingMessageHandlers from '@/Pixi/handlers/IncomingMessageHandlers'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import ClientCardResolveStack from '@/Pixi/models/ClientCardResolveStack'
import ParticleSystem from '@/Pixi/vfx/ParticleSystem'
import AudioSystem, {AudioSystemMode} from '@/Pixi/audio/AudioSystem'
import {ClientToServerMessageTypes} from '@shared/models/network/messageHandlers/ClientToServerMessageTypes'
import {ServerToClientMessageTypes} from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import GameMessage from '@shared/models/network/GameMessage'
import TargetMode from '@shared/enums/TargetMode'

export default class Core {
	public static isReady = false

	public static input?: Input
	public static socket?: WebSocket
	public static renderer?: Renderer
	public static mainHandler?: MainHandler
	public static particleSystem?: ParticleSystem
	public static keepaliveTimer: number

	public static game?: ClientGame
	public static board?: RenderedGameBoard
	public static player?: ClientPlayerInGame
	public static opponent?: ClientPlayerInGame
	public static resolveStack?: ClientCardResolveStack

	public static init(game: GameMessage, deckId: string, container: HTMLElement): void {
		const protocol = location.protocol === 'http:' ? 'ws:' : 'wss:'
		let targetUrl = `${protocol}//${window.location.host}/api/game/${game.id}?deckId=${deckId}`
		if (game.players.length >= 2) {
			targetUrl = `${protocol}//${window.location.host}/api/game/${game.id}/spectate/${game.players[0].player.id}`
		}
		if (game.players.find(playerInGame => playerInGame.player.id === store.state.player.id)) {
			targetUrl = `${protocol}//${window.location.host}/api/game/${game.id}`
		}
		const socket = new WebSocket(targetUrl)
		socket.onopen = () => this.onConnect(container)
		socket.onmessage = (event) => this.onMessage(event)
		socket.onclose = (event) => this.onDisconnect(event)
		socket.onerror = (event) => this.onError(event)
		Core.socket = socket

		Core.player = ClientPlayerInGame.fromPlayer(store.getters.player)
	}

	private static async onConnect(container: HTMLElement): Promise<void> {
		Core.keepaliveTimer = window.setInterval(() => {
			OutgoingMessageHandlers.sendKeepalive()
		}, 30000)

		await TextureAtlas.preloadComponents()

		AudioSystem.setMode(AudioSystemMode.GAME)
		Core.renderer = new Renderer(container)
		Core.particleSystem = new ParticleSystem()

		Core.game = new ClientGame()
		Core.input = new Input()
		Core.board = new RenderedGameBoard()
		Core.resolveStack = new ClientCardResolveStack()
		Core.mainHandler = MainHandler.start()

		console.info('Sending init signal to server')
		this.isReady = true
		OutgoingMessageHandlers.sendInit()
	}

	private static onMessage(event: MessageEvent): void {
		const data = JSON.parse(event.data)
		const messageType = data.type as ServerToClientMessageTypes
		const messageData = data.data as any
		const messageHighPriority = data.highPriority as boolean
		const messageAllowBatching = data.allowBatching as boolean
		const messageIgnoreWorkerThreads = data.ignoreWorkerThreads as boolean

		const handler = IncomingMessageHandlers[messageType]
		if (!handler) {
			console.error(`Unknown message type: ${messageType}`, messageData)
			return
		}

		const handlerSystemData = {
			animationThreadId: Core.mainHandler.mainAnimationThread.id
		}

		if (messageHighPriority) {
			try {
				handler(messageData, handlerSystemData)
			} catch (e) {
				console.error(e)
			}
			return
		}

		Core.mainHandler.registerMessage({
			type: messageType,
			handler: handler,
			data: messageData,
			allowBatching: messageAllowBatching || false,
			ignoreWorkerThreads: messageIgnoreWorkerThreads || false
		})
	}

	private static onDisconnect(event: CloseEvent): void {
		if (!event.wasClean) {
			console.error(`Connection closed. Reason: ${event.reason}`)
		}

		store.dispatch.leaveGame()
	}

	private static onError(event: Event): void {
		console.error('Unknown error occurred', event)
	}

	public static get isSpectating(): boolean {
		return store.state.gameStateModule.isSpectating
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
		throw new Error(`Player ${playerId} does not exist! Existing players: ${this.player?.player.id}, ${this.opponent?.player.id}`)
	}

	public static getPlayerOrNull(playerId: string): ClientPlayerInGame | null {
		if (this.player && this.player.player.id === playerId) {
			return this.player
		} else if (this.opponent && this.opponent.player.id === playerId) {
			return this.opponent
		}
		return null
	}

	public static sendMessage(type: ClientToServerMessageTypes, data: Record<string, any> | TargetMode | null): void {
		Core.socket.send(JSON.stringify({
			type: type,
			data: data
		}))
	}

	public static registerCard(renderedCard: RenderedCard): void {
		Core.renderer.registerCard(renderedCard)
	}

	public static destroyCard(renderedCard: RenderedCard): void {
		Core.renderer.destroyCard(renderedCard)
	}

	public static cleanUp(): void {
		clearInterval(Core.keepaliveTimer)
		AudioSystem.setMode(AudioSystemMode.MENU)
		Core.mainHandler.stop()
		Core.opponent = undefined
		Core.renderer.destroy()
		Core.game = undefined

		if (this.socket) {
			this.socket.close()
		}
		this.isReady = false
	}
}
