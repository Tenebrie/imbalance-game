import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import BoardRow from '@shared/models/BoardRow'
import RenderedUnit from '@/Pixi/cards/RenderedUnit'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import ClientBuffContainer from '@/Pixi/models/ClientBuffContainer'
import { getRenderScale } from '@/Pixi/renderer/RendererUtils'

export default class RenderedGameBoardRow implements BoardRow {
	public readonly index: number
	public cards: RenderedUnit[]
	public container: PIXI.Container
	public buffs: ClientBuffContainer
	private __owner: ClientPlayerInGame | null

	public readonly sprite: PIXI.Sprite
	public readonly buffContainer: PIXI.Container
	public readonly buffContainerBackground: PIXI.Sprite

	public constructor(index: number) {
		this.index = index
		this.cards = []
		this.buffs = new ClientBuffContainer(this, null)
		this.__owner = null

		this.sprite = new PIXI.Sprite(TextureAtlas.getTexture('board/row-allied'))
		this.sprite.anchor.set(0.5, 0.5)

		this.container = new PIXI.Container()
		this.container.addChild(this.sprite)

		this.buffContainer = new PIXI.Container()
		this.buffContainer.position.set(-this.sprite.width / 2 - 50 * getRenderScale().superSamplingLevel, 0)
		this.container.addChild(this.buffContainer)

		this.buffContainerBackground = new PIXI.Sprite(TextureAtlas.getTexture('board/power-allied'))
		this.buffContainerBackground.anchor.set(0.5, 0.5)
		this.buffContainer.addChild(this.buffContainerBackground)

		Core.renderer.registerGameBoardRow(this)
	}

	public getHeight(): number {
		return this.sprite.texture.height
	}

	public getInteractionVisualPosition(): PIXI.Point {
		return new PIXI.Point(
			this.container.position.x + this.buffContainer.position.x - 25 * getRenderScale().superSamplingLevel,
			this.container.position.y + this.buffContainer.position.y
		)
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
		return this.cards.find((cardOnBoard) => cardOnBoard.card.id === cardId) || null
	}

	public removeUnit(targetUnit: RenderedUnit): void {
		this.cards = this.cards.filter((unit) => unit !== targetUnit)
	}

	public destroyUnit(targetUnit: RenderedUnit): void {
		this.removeUnit(targetUnit)
		Core.destroyCard(targetUnit.card)
	}

	public clearRow(): void {
		this.cards.forEach((cardOnBoard) => {
			Core.destroyCard(cardOnBoard.card)
		})
		this.cards = []
	}

	public get owner(): ClientPlayerInGame | null {
		return this.__owner
	}

	public set owner(owner: ClientPlayerInGame | null) {
		this.__owner = owner
		if (owner === Core.player) {
			this.sprite.texture = TextureAtlas.getTexture('board/row-allied')
		} else if (owner === Core.opponent) {
			this.sprite.texture = TextureAtlas.getTexture('board/row-enemy')
		}
	}

	public isHovered(): boolean {
		return this.sprite.containsPoint(Core.input.mousePosition)
	}
}
