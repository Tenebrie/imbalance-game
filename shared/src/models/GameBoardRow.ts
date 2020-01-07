import Player from './Player'
import GameBoard from './GameBoard'
import CardOnBoard from './CardOnBoard'

export default class GameBoardRow {
	cards: CardOnBoard[]
	owner: Player | null
	gameBoard: GameBoard

	constructor(gameBoard: GameBoard) {
		this.gameBoard = gameBoard
		this.cards = []
		this.owner = null
	}
}
