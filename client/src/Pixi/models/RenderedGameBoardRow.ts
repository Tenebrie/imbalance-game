import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import GameBoardRow from '@/shared/models/GameBoardRow'
import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard'
import MIPMAP_MODES = PIXI.MIPMAP_MODES
import Point = PIXI.Point

export default class RenderedGameBoardRow extends GameBoardRow {
	sprite: PIXI.Sprite
	cards: RenderedCardOnBoard[]

	constructor() {
		super()
		this.cards = []

		const texture = PIXI.Texture.from('assets/board/boardRow.png')
		texture.baseTexture.mipmap = MIPMAP_MODES.ON
		const sprite = new PIXI.Sprite(texture)
		texture.baseTexture.on('loaded', () => {
			sprite.alpha = 0
		})
		sprite.scale.set(Core.renderer.GAME_BOARD_ROW_SCALE)
		sprite.anchor.set(0.5, 0.5)
		this.sprite = sprite

		Core.renderer.registerGameBoardRow(this)
	}

	public insertCard(card: RenderedCardOnBoard, unitIndex: number): void {
		this.cards.splice(unitIndex, 0, card)
	}

	public isHovered(mousePosition: Point): boolean {
		return this.sprite.containsPoint(mousePosition)
	}
}
