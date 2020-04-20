import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import BoardRow from '@shared/models/BoardRow'
import RenderedUnit from '@/Pixi/board/RenderedUnit'
import RenderedCard from '@/Pixi/board/RenderedCard'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'

export default class RenderedGameBoardRow extends BoardRow {
	public cards: RenderedUnit[]
	public container: PIXI.Container
	public owner: ClientPlayerInGame | null

	public readonly sprite: PIXI.Sprite

	public constructor(index: number) {
		super(index)
		this.cards = []
		this.owner = null

		this.sprite = new PIXI.Sprite(TextureAtlas.getTexture('board/board-row'))
		this.sprite.anchor.set(0.5, 0.5)

		this.container = new PIXI.Container()
		this.container.addChild(this.sprite)

		Core.renderer.registerGameBoardRow(this)
	}

	public getHeight(): number {
		return this.sprite.texture.height
	}

	public insertUnit(card: RenderedUnit, unitIndex: number): void {
		this.cards.splice(unitIndex, 0, card)
	}

	public includesCard(card: RenderedCard): boolean {
		return !!this.findUnitById(card.id)
	}

	public getCardIndex(card: RenderedCard): number {
		const cardOnBoard = this.findUnitById(card.id)!
		return this.cards.indexOf(cardOnBoard)
	}

	public findUnitById(cardId: string): RenderedUnit | null {
		return this.cards.find(cardOnBoard => cardOnBoard.card.id === cardId) || null
	}

	public removeUnit(targetUnit: RenderedUnit): void {
		this.cards = this.cards.filter(unit => unit !== targetUnit)
	}

	public destroyUnit(targetUnit: RenderedUnit): void {
		this.removeUnit(targetUnit)
		targetUnit.card.unregister()
	}

	public clearRow(): void {
		this.cards.forEach(cardOnBoard => {
			Core.unregisterCard(cardOnBoard.card)
		})
		this.cards = []
	}

	public setOwner(owner: ClientPlayerInGame | null): void {
		this.owner = owner
	}

	public isHovered(): boolean {
		return this.sprite.containsPoint(Core.input.mousePosition)
	}
}
