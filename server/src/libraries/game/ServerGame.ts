import uuidv4 from 'uuid/v4'
import Game from '../../../../common/Game'
import ChatEntry from '../../models/ChatEntry'
import ServerGameBoard from './ServerGameBoard'
import ServerPlayer from '../players/ServerPlayer'
import ServerDeck from '../../models/game/ServerDeck'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../../handlers/OutgoingMessageHandlers'

export default class ServerGame extends Game {
	id: string
	name: string
	owner: ServerPlayer
	board: ServerGameBoard
	players: ServerPlayerInGame[]
	chatHistory: ChatEntry[]

	constructor(owner: ServerPlayer, name: string) {
		super(uuidv4(), name)
		this.owner = owner
		this.board = new ServerGameBoard(this)
	}

	addPlayer(targetPlayer: ServerPlayer, deck: ServerDeck): void {
		this.players.forEach((playerInGame: ServerPlayerInGame) => {
			OutgoingMessageHandlers.notifyAboutPlayerConnected(playerInGame.player, targetPlayer)
		})
		this.players.push(ServerPlayerInGame.newInstance(targetPlayer, deck))
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
		const chatEntry = ChatEntry.newInstance(sender, message)
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
