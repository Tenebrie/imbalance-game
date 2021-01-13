import store from '@/Vue/store'
import Input from '@/Pixi/input/Input'
import Renderer from '@/Pixi/renderer/Renderer'
import GamePerformance from '@/Pixi/models/GamePerformance'
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
import AudioSystem, { AudioSystemMode } from '@/Pixi/audio/AudioSystem'
import { ClientToServerMessageTypes } from '@shared/models/network/messageHandlers/ClientToServerMessageTypes'
import GameMessage from '@shared/models/network/GameMessage'
import TargetMode from '@shared/enums/TargetMode'
import { electronWebsocketTarget, isElectron } from '@/utils/Utils'
import { ServerToClientJson } from '@shared/models/network/ServerToClientJson'
import { ClientToServerJson } from '@shared/models/network/ClientToServerJson'
import lzutf8 from 'lzutf8'
import { compressGameTraffic } from '@shared/Utils'

class Core {
	public isReady = false

	public input?: Input
	public socket?: WebSocket
	public renderer?: Renderer
	public mainHandler?: MainHandler
	public particleSystem?: ParticleSystem
	public keepaliveTimer: number

	public game?: ClientGame
	public board?: RenderedGameBoard
	public player?: ClientPlayerInGame
	public opponent?: ClientPlayerInGame
	public resolveStack?: ClientCardResolveStack

	public performance: GamePerformance = new GamePerformance()

	public init(game: GameMessage, deckId: string, container: HTMLElement): void {
		const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
		const urlHost = isElectron() ? electronWebsocketTarget() : window.location.host
		let targetUrl = `${protocol}//${urlHost}/api/game/${game.id}?deckId=${deckId}`
		if (game.players.length >= 2) {
			targetUrl = `${protocol}//${urlHost}/api/game/${game.id}/spectate/${game.players[0].player.id}`
		}
		if (game.players.find((playerInGame) => playerInGame.player.id === store.state.player.id)) {
			targetUrl = `${protocol}//${urlHost}/api/game/${game.id}`
		}
		const socket = new WebSocket(targetUrl)
		socket.onopen = () => this.onConnect(container)
		socket.onmessage = (event) => this.onMessage(event)
		socket.onclose = (event) => this.onDisconnect(event)
		socket.onerror = (event) => this.onError(event)
		this.socket = socket

		this.player = ClientPlayerInGame.fromPlayer(store.getters.player)
	}

	private async onConnect(container: HTMLElement): Promise<void> {
		this.keepaliveTimer = window.setInterval(() => {
			OutgoingMessageHandlers.sendKeepalive()
		}, 30000)

		await TextureAtlas.preloadComponents()

		AudioSystem.setMode(AudioSystemMode.GAME)
		this.renderer = new Renderer(container)
		this.particleSystem = new ParticleSystem()

		this.game = new ClientGame()
		this.input = new Input()
		this.board = new RenderedGameBoard()
		this.resolveStack = new ClientCardResolveStack()
		this.mainHandler = MainHandler.start()

		console.info('Sending init signal to server')
		this.isReady = true
		OutgoingMessageHandlers.sendInit()
	}

	private onMessage(event: MessageEvent): void {
		let data = event.data
		if (compressGameTraffic()) {
			data = lzutf8.decompress(event.data, {
				inputEncoding: 'BinaryString',
			})
		}
		data = JSON.parse(data) as ServerToClientJson
		const messageType = data.type
		const messageData = data.data
		const messageHighPriority = data.highPriority as boolean
		const messageAllowBatching = data.allowBatching as boolean
		const messageIgnoreWorkerThreads = data.ignoreWorkerThreads as boolean

		const handler = IncomingMessageHandlers[messageType]
		if (!handler) {
			console.error(`Unknown message type: ${messageType}`, messageData)
			return
		}

		const handlerSystemData = {
			animationThreadId: this.mainHandler.mainAnimationThread.id,
		}

		if (messageHighPriority) {
			try {
				handler(messageData, handlerSystemData)
			} catch (e) {
				console.error(e)
			}
			return
		}

		this.mainHandler.registerMessage({
			type: messageType,
			handler: handler,
			data: messageData,
			allowBatching: messageAllowBatching || false,
			ignoreWorkerThreads: messageIgnoreWorkerThreads || false,
		})
	}

	private onDisconnect(event: CloseEvent): void {
		if (!event.wasClean) {
			console.error(`Connection closed. Reason: ${event.reason}`)
		}

		store.dispatch.leaveGame()
	}

	private onError(event: Event): void {
		console.error('Unknown error occurred', event)
	}

	public get isSpectating(): boolean {
		return store.state.gameStateModule.isSpectating
	}

	public registerOpponent(opponent: ClientPlayerInGame): void {
		this.opponent = opponent
	}

	public getPlayer(playerId: string): ClientPlayerInGame {
		if (this.player && this.player.player.id === playerId) {
			return this.player
		} else if (this.opponent && this.opponent.player.id === playerId) {
			return this.opponent
		}
		throw new Error(`Player ${playerId} does not exist! Existing players: ${this.player?.player.id}, ${this.opponent?.player.id}`)
	}

	public getPlayerOrNull(playerId: string): ClientPlayerInGame | null {
		if (this.player && this.player.player.id === playerId) {
			return this.player
		} else if (this.opponent && this.opponent.player.id === playerId) {
			return this.opponent
		}
		return null
	}

	public sendMessage(type: ClientToServerMessageTypes, data: Record<string, any> | TargetMode | null): void {
		this.performance.logPlayerAction()
		this.send({
			type: type,
			data: data,
		})
	}

	private send(json: ClientToServerJson): void {
		this.socket.send(JSON.stringify(json))
	}

	public registerCard(renderedCard: RenderedCard): void {
		this.renderer.registerCard(renderedCard)
	}

	public destroyCard(renderedCard: RenderedCard): void {
		this.renderer.destroyCard(renderedCard)
	}

	public cleanUp(): void {
		clearInterval(this.keepaliveTimer)
		AudioSystem.setMode(AudioSystemMode.MENU)
		this.mainHandler.stop()
		this.opponent = undefined
		this.renderer.destroy()
		this.game = undefined

		if (this.socket) {
			this.socket.close()
		}
		this.isReady = false
	}
}

export default new Core()
