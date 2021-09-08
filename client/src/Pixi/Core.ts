import GameMessage from '@shared/models/network/GameMessage'
import { ClientToServerGameMessage } from '@shared/models/network/messageHandlers/ClientToServerGameMessages'
import {
	ServerToClientGameMessage,
	ServerToClientMessageTypeMappers,
} from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import { RulesetConstants } from '@shared/models/ruleset/RulesetConstants'
import { compressGameTraffic } from '@shared/Utils'
import lzutf8 from 'lzutf8'

import AudioSystem, { AudioSystemMode } from '@/Pixi/audio/AudioSystem'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import RenderedGameBoard from '@/Pixi/cards/RenderedGameBoard'
import IncomingMessageHandlers from '@/Pixi/handlers/IncomingMessageHandlers'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import Input from '@/Pixi/input/Input'
import MainHandler from '@/Pixi/MainHandler'
import ClientCardResolveStack from '@/Pixi/models/ClientCardResolveStack'
import ClientGame from '@/Pixi/models/ClientGame'
import ClientPlayerGroup from '@/Pixi/models/ClientPlayerGroup'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import GamePerformance from '@/Pixi/models/GamePerformance'
import { QueuedMessageSystemData } from '@/Pixi/models/QueuedMessage'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import Renderer from '@/Pixi/renderer/Renderer'
import ParticleSystem from '@/Pixi/vfx/ParticleSystem'
import { electronWebsocketTarget, isElectron } from '@/utils/Utils'
import store from '@/Vue/store'

class Core {
	public isReady = false

	public input!: Input
	public socket!: WebSocket
	public renderer!: Renderer
	public mainHandler!: MainHandler
	public particleSystem!: ParticleSystem
	public keepaliveTimer: number | undefined

	public game: ClientGame = new ClientGame()
	public board!: RenderedGameBoard
	public player!: ClientPlayerGroup
	public opponent!: ClientPlayerGroup
	public resolveStack!: ClientCardResolveStack

	public performance: GamePerformance = new GamePerformance()

	public init(game: GameMessage, deckId: string, container: HTMLElement): void {
		const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
		const urlHost = isElectron() ? electronWebsocketTarget() : window.location.host

		let targetGroupIndex = game.players[0].openHumanSlots > 0 ? 0 : game.players[1].openHumanSlots > 0 ? 1 : null
		// No slots available -> spectating
		const isSpectating = targetGroupIndex === null
		if (isSpectating || targetGroupIndex === null) {
			targetGroupIndex = 0
		}
		const opponentGroupIndex = targetGroupIndex === 0 ? 1 : 0

		const targetGroupId = game.players[targetGroupIndex].id
		const opponentGroupId = game.players[opponentGroupIndex].id
		let targetUrl = `${protocol}//${urlHost}/api/game/${game.id}?deckId=${deckId}&groupId=${targetGroupId}`
		if (isSpectating) {
			const targetPlayerId = game.players[targetGroupIndex]!.players[0].player.id
			targetUrl = `${protocol}//${urlHost}/api/game/${game.id}/spectate/${targetPlayerId}`
		}
		// Reconnecting
		if (
			game.players.flatMap((playerGroup) => playerGroup.players).find((playerInGame) => playerInGame.player.id === store.state.player?.id)
		) {
			targetUrl = `${protocol}//${urlHost}/api/game/${game.id}`
		}
		this.__rulesetConstants = game.ruleset.constants
		const socket = new WebSocket(targetUrl)
		socket.onopen = () => this.onConnect(container)
		socket.onmessage = (event) => this.onMessage(event, socket)
		socket.onclose = (event) => this.onDisconnect(event, socket)
		socket.onerror = (event) => this.onError(event, socket)
		this.socket = socket

		this.player = new ClientPlayerGroup(targetGroupId)
		this.opponent = new ClientPlayerGroup(opponentGroupId)
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

	private onMessage(event: MessageEvent, socket: WebSocket): void {
		if (socket !== this.socket) {
			return
		}

		let data = event.data
		if (compressGameTraffic()) {
			data = lzutf8.decompress(event.data, {
				inputEncoding: 'BinaryString',
			})
		}
		const parsedData = JSON.parse(data) as ServerToClientGameMessage
		const messageType = parsedData.type
		const messageData = parsedData.data
		const messageHighPriority = parsedData.highPriority
		const messageAllowBatching = parsedData.allowBatching
		const messageIgnoreWorkerThreads = parsedData.ignoreWorkerThreads

		const handler = IncomingMessageHandlers[messageType] as (
			data: ServerToClientMessageTypeMappers[typeof messageType],
			systemData: QueuedMessageSystemData
		) => void
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
			data: messageData,
			allowBatching: messageAllowBatching || false,
			ignoreWorkerThreads: messageIgnoreWorkerThreads || false,
		})
	}

	private onDisconnect(event: CloseEvent, socket: WebSocket): void {
		if (socket !== this.socket) {
			return
		}

		if (!event.wasClean) {
			console.error(`Connection closed. Reason: ${event.reason}`, event)
		}

		store.dispatch.leaveGame()
	}

	private onError(event: Event, socket: WebSocket): void {
		if (socket !== this.socket) {
			return
		}

		console.error('Unknown error occurred', event)
	}

	public get isSpectating(): boolean {
		return store.state.gameStateModule.isSpectating
	}

	private __rulesetConstants!: RulesetConstants

	public get constants(): RulesetConstants {
		return { ...this.__rulesetConstants }
	}

	public get allPlayers(): ClientPlayerInGame[] {
		return [this.player, this.opponent].flatMap((playerGroup) => playerGroup.players)
	}

	public getPlayerGroup(groupId: string): ClientPlayerGroup {
		const group = this.getPlayerGroupOrNull(groupId)
		if (!group) {
			throw new Error(`Player group ${groupId} does not exist!`)
		}
		return group
	}

	public getPlayerGroupOrNull(groupId: string): ClientPlayerGroup | null {
		if (this.player.id === groupId) {
			return this.player
		} else if (this.opponent.id === groupId) {
			return this.opponent
		}
		return null
	}

	public getPlayer(playerId: string): ClientPlayerInGame {
		const player = this.getPlayerOrNull(playerId)
		if (!player) {
			throw new Error(`Player ${playerId} does not exist!`)
		}
		return player
	}

	public getPlayerOrNull(playerId: string): ClientPlayerInGame | null {
		return (
			this.player.players.find((player) => player.player.id === playerId) ||
			this.opponent.players.find((player) => player.player.id === playerId) ||
			null
		)
	}

	public sendMessage(message: ClientToServerGameMessage): void {
		this.performance.logPlayerAction()
		this.send(message)
	}

	private send(json: ClientToServerGameMessage): void {
		this.socket.send(JSON.stringify(json))
	}

	public registerCard(renderedCard: RenderedCard): void {
		this.renderer.registerCard(renderedCard)
	}

	public destroyCard(renderedCard: RenderedCard): void {
		this.renderer.destroyCard(renderedCard)
	}

	public cleanUp(): void {
		if (!this.isReady) {
			return
		}
		this.isReady = false
		clearInterval(this.keepaliveTimer)
		AudioSystem.setMode(AudioSystemMode.MENU)
		this.mainHandler.stop()
		this.allPlayers.forEach((player) => player.destroyObject())
		this.player = new ClientPlayerGroup('emptyGroup')
		this.opponent = new ClientPlayerGroup('emptyGroup')
		this.board.destroyObject()
		this.input.destroyObject()
		this.renderer.destroyObject()

		if (this.socket) {
			this.socket.close(1000, 'Clean up')
		}
		this.isReady = false
	}
}

export default new Core()
