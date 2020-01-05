import GameBoard from "./GameBoard";
import PlayerInGame from "./PlayerInGame";
import ChatEntry from '../server/src/models/ChatEntry'

export default class Game {
	id: string
	name: string
	board: GameBoard
	players: PlayerInGame[]
	chatHistory: ChatEntry[]

	constructor(id: string, name: string) {
		this.id = id
		this.name = name
		this.board = new GameBoard()
		this.players = []
		this.chatHistory = []
	}
}
