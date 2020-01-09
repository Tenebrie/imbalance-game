import Constants from '@/shared/Constants'
import GameBoard from '@/shared/models/GameBoard'
import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard'
import RenderedGameBoardRow from '@/Pixi/models/RenderedGameBoardRow'
import Point = PIXI.Point

export default class RenderedGameBoard extends GameBoard {
	rows: RenderedGameBoardRow[]
	isInverted: boolean = false

	constructor() {
		super()
		this.rows = []
		for (let i = 0; i < Constants.GAME_BOARD_ROW_COUNT; i++) {
			this.rows.push(new RenderedGameBoardRow())
		}
	}

	public insertCard(card: RenderedCardOnBoard, rowIndex: number, unitIndex: number): void {
		this.rows[rowIndex].insertCard(card, unitIndex)
	}

	public findCardById(cardId: string): RenderedCardOnBoard | null {
		const cards = this.rows.map(row => row.cards).flat()
		return cards.find(cardOnBoard => cardOnBoard.card.id === cardId) || null
	}

	public removeCardById(cardId: string): void {
		const rowWithCard = this.rows.find(row => !!row.cards.find(cardOnBoard => cardOnBoard.card.id === cardId))
		if (!rowWithCard) {
			console.error(`No row includes card ${cardId}`)
			return
		}

		rowWithCard.removeCardById(cardId)
	}

	public isHovered(mousePosition: Point): boolean {
		return this.rows.some(row => row.isHovered(mousePosition))
	}

	public setInverted(isInverted: boolean): void {
		this.isInverted = isInverted
	}
}
