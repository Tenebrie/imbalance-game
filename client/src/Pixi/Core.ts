import GameMessage from '@shared/models/network/GameMessage'
import { ClientToServerGameMessage } from '@shared/models/network/messageHandlers/ClientToServerGameMessages'
import {
	ServerToClientGameMessage,
	ServerToClientGameMessageSelector,
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

		const { targetGroup, opponentGroup, targetUrl } = (() => {
			if (!store.state.player) {
				throw new Error('Unable to connect to game before fetching player data.')
			}

			// Player is already in the game -> reconnect
			const thisPlayerId = store.state.player.id
			const groupWithPlayer = game.players.find((group) => group.players.some((playerInGame) => playerInGame.player.id === thisPlayerId))

			if (groupWithPlayer) {
				return {
					targetGroup: groupWithPlayer,
					opponentGroup: game.players.find((group) => group !== groupWithPlayer)!,
					targetUrl: `/api/game/${game.id}`,
				}
			}

			// No slots available -> spectating
			if (game.players.every((group) => group.openHumanSlots === 0)) {
				const targetPlayerId = game.players[0].players[0].player.id
				return {
					targetGroup: game.players[0],
					opponentGroup: game.players[1],
					targetUrl: `/api/game/${game.id}/spectate/${targetPlayerId}`,
				}
			}

			// Initial connect
			const targetGroup = game.players.find((group) => group.openHumanSlots > 0)

			if (!targetGroup) {
				throw new Error('The player slots are gone somehow...')
			}

			return {
				targetGroup: targetGroup,
				opponentGroup: game.players.find((group) => group !== targetGroup)!,
				targetUrl: `/api/game/${game.id}?deckId=${deckId}&groupId=${targetGroup.id}`,
			}
		})()

		this.__rulesetConstants = game.ruleset.constants
		const socket = new WebSocket(`${protocol}//${urlHost}${targetUrl}`)
		socket.onopen = () => this.onConnect(container)
		socket.onmessage = (event) => this.onMessage(event, socket)
		socket.onclose = (event) => this.onDisconnect(event, socket)
		socket.onerror = (event) => this.onError(event, socket)
		this.socket = socket

		this.player = new ClientPlayerGroup(targetGroup.id)
		this.opponent = new ClientPlayerGroup(opponentGroup.id)
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
		this.executeSocketMessage(parsedData)
	}

	public executeSocketMessage(parsedData: ServerToClientGameMessage): void {
		const messageType = parsedData.type
		const messageData = parsedData.data
		const messageSkipQueue = parsedData.skipQueue
		const messageAllowBatching = parsedData.allowBatching
		const messageIgnoreWorkerThreads = parsedData.ignoreWorkerThreads

		const handler = IncomingMessageHandlers[messageType] as (
			data: ServerToClientMessageTypeMappers[typeof messageType],
			systemData: QueuedMessageSystemData
		) => ServerToClientGameMessageSelector<any>[] | void
		if (!handler) {
			console.error(`Unknown message type: ${messageType}`, messageData)
			return
		}

		const handlerSystemData = {
			animationThreadId: this.mainHandler.mainAnimationThread.id,
		}

		let unwrappedMessages: ServerToClientGameMessageSelector<any>[] | void = []
		if (messageSkipQueue) {
			try {
				unwrappedMessages = handler(messageData, handlerSystemData)
			} catch (e) {
				console.error(e)
			}

			if (unwrappedMessages && unwrappedMessages.length > 0) {
				unwrappedMessages.forEach((message) => this.executeSocketMessage(message))
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
