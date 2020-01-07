import uuidv4 from 'uuid/v4'
import Game from '../../shared/models/Game'
import ServerGameBoard from './ServerGameBoard'
import Player from '../../shared/models/Player'
import ServerPlayer from '../players/ServerPlayer'
import ServerChatEntry from '../../models/ServerChatEntry'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../../handlers/OutgoingMessageHandlers'
import PlayerInGame from '../../shared/models/PlayerInGame'
import ServerCardDeck from '../../models/game/ServerCardDeck'

export default class ServerGame extends Game {
	owner: ServerPlayer
	board: ServerGameBoard
	players: ServerPlayerInGame[]
	chatHistory: ServerChatEntry[]

	constructor(owner: ServerPlayer, name: string) {
		super(uuidv4(), name)
		this.owner = owner
		this.board = new ServerGameBoard(this)
		this.players = []
		this.chatHistory = []
	}

	addPlayer(targetPlayer: ServerPlayer, deck: ServerCardDeck): ServerPlayerInGame {
		const serverPlayerInGame = ServerPlayerInGame.newInstance(targetPlayer, deck)

		console.log(this.players.length)
		this.players.forEach((playerInGame: ServerPlayerInGame) => {
			OutgoingMessageHandlers.sendOpponent(playerInGame.player, serverPlayerInGame)
			OutgoingMessageHandlers.notifyAboutPlayerConnected(playerInGame.player, targetPlayer)
		})

		this.players.push(serverPlayerInGame)
		return serverPlayerInGame
	}

	getPlayerInGame(player: Player): PlayerInGame {
		return this.players.find(playerInGame => playerInGame.player === player)
	}

	removePlayer(targetPlayer: ServerPlayer): void {
		const registeredPlayer = this.players.find(playerInGame => playerInGame.player.id === targetPlayer.id)
		if (!registeredPlayer) {
			return
		}

		this.board.destroyAllCards(targetPlayer)
		this.players.splice(this.players.indexOf(registeredPlayer), 1)
		this.players.forEach((playerInGame: ServerPlayerInGame) => {
			OutgoingMessageHandlers.notifyAboutPlayerDisconnected(playerInGame.player, targetPlayer)
		})
	}

	createChatEntry(sender: ServerPlayer, message: string): void {
		const chatEntry = ServerChatEntry.newInstance(sender, message)
		this.chatHistory.push(chatEntry)
		this.players.forEach((playerInGame: ServerPlayerInGame) => {
			OutgoingMessageHandlers.notifyAboutChatEntry(playerInGame.player, chatEntry)
		})
	}

	static newOwnedInstance(owner: ServerPlayer, name: string): ServerGame {
		const randomNumber = Math.floor(1000 + Math.random() * 9000)
		name = name || (owner.username + `'s game #${randomNumber}`)
		return new ServerGame(owner, name)
	}
}
