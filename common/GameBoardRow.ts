import { Card } from './Card'
import Player from './Player'
import GameBoard from "./GameBoard"
import { CardOnBoard } from './CardOnBoard'

export default class GameBoardRow {
	cards: CardOnBoard[]
	owner: Player
	gameBoard: GameBoard
	
	constructor(gameBoard: GameBoard) {
		this.gameBoard = gameBoard
	}

	public getCardOnBoard(card: Card): CardOnBoard {
		return this.cards.find((cardOnBoard: CardOnBoard) => cardOnBoard.card === card)
	}

	public containsCard(card: Card): boolean {
		return !!this.getCardOnBoard(card)
	}

	public insertCard(card: Card, position: number): void {
		const cardOnBoard = CardOnBoard.newInstance(card, this.owner, this)
		this.cards.splice(position, 0, cardOnBoard)
	}

	public removeCard(card: Card): void {
		const cardOnBoard = this.getCardOnBoard(card)
		this.cards.splice(this.cards.indexOf(cardOnBoard), 1)
	}

	public setOwner(player: Player): void {
		this.owner = player
	}
}
