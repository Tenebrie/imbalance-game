import Constants from '@/shared/Constants'
import GameBoard from '@/shared/models/GameBoard'
import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard'
import RenderedGameBoardRow from '@/Pixi/models/RenderedGameBoardRow'
import QueuedCardAttack from '@/shared/models/QueuedCardAttack'
import RenderedQueuedCardAttack from '@/Pixi/models/RenderedQueuedCardAttack'

export default class RenderedGameBoard extends GameBoard {
	rows: RenderedGameBoardRow[]
	isInverted: boolean = false
	queuedAttacks: RenderedQueuedCardAttack[]

	constructor() {
		super()
		this.rows = []
		this.queuedAttacks = []
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

	public getAllCards() {
		return this.rows.map(row => row.cards).flat()
	}

	public clearBoard(): void {
		this.rows.forEach(row => row.clearRow())
	}

	public updateQueuedAttacks(newAttacks: RenderedQueuedCardAttack[], removedAttacks: RenderedQueuedCardAttack[]): void {
		removedAttacks.forEach(queuedAttack => {
			queuedAttack.destroy()
		})
		this.queuedAttacks = this.queuedAttacks.filter(queuedAttack => !removedAttacks.includes(queuedAttack))
		this.queuedAttacks = this.queuedAttacks.concat(newAttacks)
	}

	public setInverted(isInverted: boolean): void {
		this.isInverted = isInverted
	}
}
