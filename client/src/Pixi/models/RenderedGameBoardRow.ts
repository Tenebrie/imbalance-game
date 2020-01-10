import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import GameBoardRow from '@/shared/models/GameBoardRow'
import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard'
import Point = PIXI.Point

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

	public findCardById(cardId: string): RenderedCardOnBoard | null {
		return this.cards.find(cardOnBoard => cardOnBoard.card.id === cardId) || null
	}

	public removeCardById(cardId: string): void {
		const cardOnBoard = this.findCardById(cardId)
		if (!cardOnBoard) { return }

		this.cards.splice(this.cards.indexOf(cardOnBoard), 1)
		cardOnBoard.card.unregister()
	}

	public isHovered(mousePosition: Point): boolean {
		return this.sprite.containsPoint(mousePosition)
	}
}
