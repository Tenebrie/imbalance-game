import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import GameBoardRow from '@/Pixi/shared/models/GameBoardRow'
import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard'
import RenderedCard from '@/Pixi/models/RenderedCard'
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

		this.container = new PIXI.Container()
		this.container.addChild(this.spriteOwned)
		this.container.addChild(this.spriteNeutral)
		this.container.addChild(this.spriteOpponent)

		Core.renderer.registerGameBoardRow(this)
	}

	public getHeight(): number {
		return this.spriteNeutral.texture.height
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

	public updateOwnership(): void {
		this.spriteOwned.alpha = 0
		this.spriteNeutral.alpha = 0
		this.spriteOpponent.alpha = 0
		if (this.isOwnedByPlayer()) {
			this.owner = Core.player
			this.spriteOwned.alpha = 1
		} else if (this.isOwnedByOpponent()) {
			this.owner = Core.opponent
			this.spriteOpponent.alpha = 1
		} else {
			this.owner = null
			this.spriteNeutral.alpha = 1
		}
	}

	public isHovered(mousePosition: PIXI.Point): boolean {
		return this.spriteNeutral.containsPoint(mousePosition)
	}

	public isOwnedByPlayer(): boolean {
		if (!Core.player) {
			return false
		}

		const index = this.index
		const invertedBoard = Core.board.isInverted
		return (invertedBoard && index < Core.player.rowsOwned) || (!invertedBoard && index >= Constants.GAME_BOARD_ROW_COUNT - Core.player.rowsOwned)
	}

	public isOwnedByOpponent(): boolean {
		if (!Core.opponent) {
			return false
		}

		const index = this.index

		const invertedBoard = !Core.board.isInverted
		return (invertedBoard && index < Core.opponent.rowsOwned) || (!invertedBoard && index >= Constants.GAME_BOARD_ROW_COUNT - Core.opponent.rowsOwned)
	}
}
