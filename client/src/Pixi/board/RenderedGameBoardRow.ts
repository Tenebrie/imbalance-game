import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import GameBoardRow from '@/Pixi/shared/models/GameBoardRow'
import RenderedCardOnBoard from '@/Pixi/board/RenderedCardOnBoard'
import RenderedCard from '@/Pixi/board/RenderedCard'
import Constants from '../shared/Constants'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'

export default class RenderedGameBoardRow extends GameBoardRow {
	cards: RenderedCardOnBoard[]
	container: PIXI.Container
	owner: ClientPlayerInGame | null

	private readonly spriteOwned: PIXI.Sprite
	private readonly spriteNeutral: PIXI.Sprite
	private readonly spriteOpponent: PIXI.Sprite

	constructor(index: number) {
		super(index)
		this.cards = []
		this.owner = null

		this.spriteOwned = new PIXI.Sprite(TextureAtlas.getTexture('board/boardRow_owned'))
		this.spriteNeutral = new PIXI.Sprite(TextureAtlas.getTexture('board/boardRow_neutral'))
		this.spriteOpponent = new PIXI.Sprite(TextureAtlas.getTexture('board/boardRow_opponent'))
		this.spriteOwned.anchor.set(0.5, 0.5)
		this.spriteNeutral.anchor.set(0.5, 0.5)
		this.spriteOpponent.anchor.set(0.5, 0.5)
		this.spriteOwned.visible = false
		this.spriteOpponent.visible = false

		this.container = new PIXI.Container()
		this.container.addChild(this.spriteOwned)
		this.container.addChild(this.spriteNeutral)
		this.container.addChild(this.spriteOpponent)

		Core.renderer.registerGameBoardRow(this)
	}

	public getHeight(): number {
		return this.spriteNeutral.texture.height
	}

	public insertUnit(card: RenderedCardOnBoard, unitIndex: number): void {
		this.cards.splice(unitIndex, 0, card)
	}

	public includesCard(card: RenderedCard): boolean {
		return !!this.findUnitById(card.id)
	}

	public getCardIndex(card: RenderedCard): number {
		const cardOnBoard = this.findUnitById(card.id)!
		return this.cards.indexOf(cardOnBoard)
	}

	public findUnitById(cardId: string): RenderedCardOnBoard | null {
		return this.cards.find(cardOnBoard => cardOnBoard.card.id === cardId) || null
	}

	public removeUnit(targetUnit: RenderedCardOnBoard): void {
		this.cards = this.cards.filter(unit => unit !== targetUnit)
	}

	public destroyUnit(targetUnit: RenderedCardOnBoard): void {
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

		this.spriteOwned.visible = false
		this.spriteNeutral.visible = false
		this.spriteOpponent.visible = false
		if (this.owner === Core.player) {
			this.spriteOwned.visible = true
		} else if (this.owner === Core.opponent) {
			this.spriteOpponent.visible = true
		} else {
			this.spriteNeutral.visible = true
		}
	}

	public isHovered(mousePosition: PIXI.Point): boolean {
		return (this.owner === Core.player && this.spriteOwned.containsPoint(mousePosition)) || (this.owner === null && this.spriteNeutral.containsPoint(mousePosition)) || (this.owner === Core.opponent && this.spriteOpponent.containsPoint(mousePosition))
	}
}
