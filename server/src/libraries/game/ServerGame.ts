import uuidv4 from 'uuid/v4'
import Game from '../../shared/models/Game'
import Player from '../../shared/models/Player'
import ServerGameBoard from './ServerGameBoard'
import ServerPlayer from '../players/ServerPlayer'
import GameTurnPhase from '../../enums/GameTurnPhase'
import ServerChatEntry from '../../models/ServerChatEntry'
import VoidPlayerInGame from '../../utils/VoidPlayerInGame'
import ServerCardDeck from '../../models/game/ServerCardDeck'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../../handlers/OutgoingMessageHandlers'

const MAXIMUM_TIME = 48

export default class ServerGame extends Game {
	currentTime: number
	turnPhase: GameTurnPhase
	owner: ServerPlayer
	board: ServerGameBoard
	players: ServerPlayerInGame[]
	chatHistory: ServerChatEntry[]

	constructor(owner: ServerPlayer, name: string) {
		super(uuidv4(), name)
		this.currentTime = 0
		this.turnPhase = GameTurnPhase.DEPLOY
		this.owner = owner
		this.board = new ServerGameBoard()
		this.players = []
		this.chatHistory = []
	}

	public addPlayer(targetPlayer: ServerPlayer, deck: ServerCardDeck): ServerPlayerInGame {
		const serverPlayerInGame = ServerPlayerInGame.newInstance(targetPlayer, deck)

		this.players.forEach((playerInGame: ServerPlayerInGame) => {
			OutgoingMessageHandlers.sendOpponent(playerInGame.player, serverPlayerInGame)
		})

		this.players.push(serverPlayerInGame)
		return serverPlayerInGame
	}

	public getPlayerInGame(player: Player): ServerPlayerInGame {
		return this.players.find(playerInGame => playerInGame.player === player)
	}

	public getOpponent(player: ServerPlayerInGame): ServerPlayerInGame {
		return this.players.find(otherPlayer => otherPlayer !== player) || VoidPlayerInGame.get()
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

	public setTurnPhase(turnPhase: GameTurnPhase): void {
		this.turnPhase = turnPhase
		this.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutPhaseAdvance(playerInGame.player, this.turnPhase)
		})
	}

	public isPlayersFinishedTurn(): boolean {
		const notFinishedPlayers = this.players.filter(playerInGame => playerInGame.timeUnits > 0)
		return notFinishedPlayers.length === 0
	}

	public advanceToCombatPhase(): void {
		this.setTurnPhase(GameTurnPhase.COMBAT)

		this.board.advanceCardInitiative(this)
	}

	public isUnitsFinishedAttacking(): boolean {
		const allCards = this.board.getAllCards()
		const attackingCards = this.board.queuedAttacks.map(queuedAttack => queuedAttack.attacker)
		const cardsCanAttack = allCards
			.filter(cardOnBoard => cardOnBoard.canAttackAnyTarget(this))
			.filter(cardOnBoard => !attackingCards.includes(cardOnBoard))
		return cardsCanAttack.length === 0
	}

	public advanceToDeployPhase(): void {
		this.setTurnPhase(GameTurnPhase.DEPLOY)

		this.board.releaseQueuedAttacks(this)

		this.currentTime += 1

		this.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutTimeAdvance(playerInGame.player, this.currentTime, MAXIMUM_TIME)
			playerInGame.advanceTime()
		})
	}

	static newOwnedInstance(owner: ServerPlayer, name: string): ServerGame {
		const randomNumber = Math.floor(1000 + Math.random() * 9000)
		name = name || (owner.username + `'s game #${randomNumber}`)
		return new ServerGame(owner, name)
	}
}
