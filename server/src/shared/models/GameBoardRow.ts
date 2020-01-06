import Card from './Card'
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

	public getCardOnBoard(card: Card): CardOnBoard | null {
		return this.cards.find((cardOnBoard: CardOnBoard) => cardOnBoard.card === card) || null
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
		if (!cardOnBoard) {
			console.warn('Trying to remove null card!', card)
			return
		}
		this.cards.splice(this.cards.indexOf(cardOnBoard), 1)
	}

	public setOwner(player: Player): void {
		this.owner = player
	}
}
