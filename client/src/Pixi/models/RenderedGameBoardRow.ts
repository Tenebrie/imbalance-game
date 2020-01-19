import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import GameBoardRow from '@/Pixi/shared/models/GameBoardRow'
import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard'
import RenderedCard from '@/Pixi/models/RenderedCard'

export default class RenderedGameBoardRow extends GameBoardRow {
	sprite: PIXI.Sprite
	cards: RenderedCardOnBoard[]

	constructor() {
		super()
		this.cards = []

		const texture = PIXI.Texture.from('assets/board/boardRow.png')
		const sprite = new PIXI.Sprite(texture)
		texture.baseTexture.on('loaded', () => {
			sprite.alpha = 0
		})
		sprite.anchor.set(0.5, 0.5)
		this.sprite = sprite

		Core.renderer.registerGameBoardRow(this)
	}

	public insertCard(card: RenderedCardOnBoard, unitIndex: number): void {
		this.cards.splice(unitIndex, 0, card)
	}

	public includesCard(card: RenderedCard): boolean {
		return !!this.findCardById(card.id)
	}

	public getCardIndex(card: RenderedCard): number {
		const cardOnBoard = this.findCardById(card.id)!
		return this.cards.indexOf(cardOnBoard)
	}

	public findCardById(cardId: string): RenderedCardOnBoard | null {
		return this.cards.find(cardOnBoard => cardOnBoard.card.id === cardId) || null
	}

	public removeCardById(cardId: string): void {
		const cardOnBoard = this.findCardById(cardId)
		if (!cardOnBoard) { return }

		this.cards.splice(this.cards.indexOf(cardOnBoard), 1)
		cardOnBoard.card.unregister()
	}

	public clearRow(): void {
		this.cards.forEach(cardOnBoard => {
			Core.unregisterCard(cardOnBoard.card)
		})
		this.cards = []
	}

	public isHovered(mousePosition: PIXI.Point): boolean {
		return this.sprite.containsPoint(mousePosition)
	}
}
