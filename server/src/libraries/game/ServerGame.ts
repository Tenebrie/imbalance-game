import uuidv4 from 'uuid/v4'
import Game from '../../shared/models/Game'
import Player from '../../shared/models/Player'
import ServerGameBoard from './ServerGameBoard'
import ServerPlayer from '../players/ServerPlayer'
import ServerChatEntry from '../../models/ServerChatEntry'
import VoidPlayerInGame from '../../utils/VoidPlayerInGame'
import GameTurnPhase from '../../shared/enums/GameTurnPhase'
import ServerCardDeck from '../../models/game/ServerCardDeck'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../../handlers/OutgoingMessageHandlers'
import GameLibrary from './GameLibrary'

export default class ServerGame extends Game {
	MAXIMUM_TIME = 12

	isStarted: boolean
	currentTime: number
	turnPhase: GameTurnPhase
	owner: ServerPlayer
	board: ServerGameBoard
	players: ServerPlayerInGame[]
	chatHistory: ServerChatEntry[]

	constructor(owner: ServerPlayer, name: string) {
		super(uuidv4(), name)
		this.isStarted = false
		this.currentTime = 0
		this.turnPhase = GameTurnPhase.BEFORE_GAME
		this.owner = owner
		this.board = new ServerGameBoard(this)
		this.players = []
		this.chatHistory = []
	}

	public addPlayer(targetPlayer: ServerPlayer, deck: ServerCardDeck): ServerPlayerInGame {
		const serverPlayerInGame = ServerPlayerInGame.newInstance(this, targetPlayer, deck)

		this.players.forEach((playerInGame: ServerPlayerInGame) => {
			OutgoingMessageHandlers.sendOpponent(playerInGame.player, serverPlayerInGame)
		})

		this.players.push(serverPlayerInGame)
		return serverPlayerInGame
	}

	public start(): void {
		this.isStarted = true

		const playerOne = this.players[0]
		const playerTwo = this.players[1] || VoidPlayerInGame.for(this)
		console.info(`Starting game ${this.id}: ${playerOne.player.username} vs ${playerTwo.player.username}`)

		this.players.forEach(playerInGame => {
			OutgoingMessageHandlers.sendDeck(playerInGame.player, this)
			OutgoingMessageHandlers.sendOpponent(playerInGame.player, this.getOpponent(playerInGame))
			OutgoingMessageHandlers.notifyAboutTimeAdvance(playerInGame.player, this.currentTime, this.MAXIMUM_TIME)
			OutgoingMessageHandlers.notifyAboutGameStart(playerInGame.player, this.players.indexOf(playerInGame) === 1)
		})

		this.players.forEach(playerInGame => {
			playerInGame.drawCards(10)
		})
		this.startNewTurnPhase()
	}

	public getPlayerInGame(player: Player): ServerPlayerInGame {
		return this.players.find(playerInGame => playerInGame.player === player)
	}

	public getOpponent(player: ServerPlayerInGame): ServerPlayerInGame {
		return this.players.find(otherPlayer => otherPlayer !== player) || VoidPlayerInGame.for(this)
	}

	public removePlayer(targetPlayer: ServerPlayer): void {
		const registeredPlayer = this.players.find(playerInGame => playerInGame.player.id === targetPlayer.id)
		if (!registeredPlayer) {
			return
		}

		this.players.splice(this.players.indexOf(registeredPlayer), 1)
		this.players.forEach((playerInGame: ServerPlayerInGame) => {
			// OutgoingMessageHandlers.notifyAboutPlayerDisconnected(playerInGame.player, targetPlayer)
		})
	}

	public createChatEntry(sender: ServerPlayer, message: string): void {
		const chatEntry = ServerChatEntry.newInstance(sender, message)
		this.chatHistory.push(chatEntry)
		this.players.forEach((playerInGame: ServerPlayerInGame) => {
			OutgoingMessageHandlers.notifyAboutChatEntry(playerInGame.player, chatEntry)
		})
	}

	public setTime(time: number): void {
		this.currentTime = time

		this.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutTimeAdvance(playerInGame.player, this.currentTime, this.MAXIMUM_TIME)
		})
	}

	public setTurnPhase(turnPhase: GameTurnPhase): void {
		this.turnPhase = turnPhase

		this.board.getAllUnits().forEach(unit => unit.card.onTurnPhaseChanged(unit, this.turnPhase))

		this.players.forEach(playerInGame => {
			playerInGame.markTurnNotEnded()
			OutgoingMessageHandlers.notifyAboutPhaseAdvance(playerInGame.player, this.turnPhase)
		})
	}

	public isDeployPhaseFinished(): boolean {
		const notFinishedPlayers = this.players.filter(playerInGame => !playerInGame.turnEnded && playerInGame.timeUnits > 0)
		return notFinishedPlayers.length === 0
	}

	public isSkirmishPhaseFinished(): boolean {
		const notFinishedPlayers = this.players.filter(playerInGame => !playerInGame.turnEnded && this.board.getCardsOwnedByPlayer(playerInGame).length > 0)
		return notFinishedPlayers.length === 0
	}

	public advancePhase(): void {
		if (this.turnPhase === GameTurnPhase.TURN_START) {
			this.startDeployPhase()
		} else if (this.turnPhase === GameTurnPhase.DEPLOY) {
			this.startSkirmishPhase()
		} else if (this.turnPhase === GameTurnPhase.SKIRMISH && this.currentTime === this.MAXIMUM_TIME) {
			this.startCombatPhase()
		} else if (this.turnPhase === GameTurnPhase.SKIRMISH && this.currentTime < this.MAXIMUM_TIME) {
			this.startEndTurnPhase()
		} else if (this.turnPhase === GameTurnPhase.COMBAT) {
			this.startEndTurnPhase()
		} else if (this.turnPhase === GameTurnPhase.TURN_END) {
			this.startNewTurnPhase()
		}
	}

	public startNewTurnPhase(): void {
		this.setTurnPhase(GameTurnPhase.TURN_START)
		this.advancePhase()
	}

	public startDeployPhase(): void {
		this.board.releaseQueuedAttacks()

		this.setTime(this.currentTime + 1)
		this.players.forEach(playerInGame => playerInGame.advanceTime())

		this.setTurnPhase(GameTurnPhase.DEPLOY)
	}

	public startSkirmishPhase(): void {
		this.setTurnPhase(GameTurnPhase.SKIRMISH)
	}

	public startCombatPhase(): void {
		this.setTurnPhase(GameTurnPhase.COMBAT)
		this.board.getAllUnits().forEach(cardOnBoard => this.board.removeCard(cardOnBoard))
		this.setTime(0)
		this.setTurnPhase(GameTurnPhase.DEPLOY)
	}

	public startEndTurnPhase(): void {
		this.setTurnPhase(GameTurnPhase.TURN_END)
		this.advancePhase()
	}

	public finish(reason: string): void {
		this.setTurnPhase(GameTurnPhase.AFTER_GAME)

		const remainingPlayerInGame = this.players[0]
		OutgoingMessageHandlers.notifyAboutVictory(remainingPlayerInGame.player)
		console.info(`Game ${this.id} finished. ${remainingPlayerInGame.player.username} won! [${reason}]`)

		setTimeout(() => {
			const gameLibrary: GameLibrary = global.gameLibrary
			gameLibrary.destroyGame(this)
		}, 120000)
	}

	static newOwnedInstance(owner: ServerPlayer, name: string): ServerGame {
		const randomNumber = Math.floor(1000 + Math.random() * 9000)
		name = name || (owner.username + `'s game #${randomNumber}`)
		return new ServerGame(owner, name)
	}
}
