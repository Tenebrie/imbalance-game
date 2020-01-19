import * as PIXI from 'pixi.js'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import Card from '@/Pixi/shared/models/Card'
import { CardDisplayMode } from '@/Pixi/enums/CardDisplayMode'

export default class CardAttributes extends PIXI.Container {
	card: Card
	displayMode: CardDisplayMode

	constructor(card: Card, displayMode: CardDisplayMode) {
		super()
		this.card = card
		this.displayMode = displayMode
		this.updateChildren()

		if (displayMode === CardDisplayMode.ON_BOARD) {
			this.scale.set(1.75)
		}
	}

	public updateChildren() {
		while (this.children.length > 0) {
			this.removeChildAt(0)
		}

		const width = Math.round(this.getCardAttributesWidth())

		let leftPartTexture = TextureAtlas.getTexture('components/bg-stats-left')
		let rightPartTexture = TextureAtlas.getTexture('components/bg-stats-right')
		let middlePartTexture = TextureAtlas.getTexture('components/bg-stats-middle')
		if (this.displayMode === CardDisplayMode.ON_BOARD) {
			rightPartTexture = TextureAtlas.getTexture('components/bg-stats-right-zoom')
		}

		const bgStatsLeft = new PIXI.Sprite(leftPartTexture)
		const bgStatsMiddle = new PIXI.TilingSprite(middlePartTexture, middlePartTexture.width, middlePartTexture.height)
		const bgStatsRight = new PIXI.Sprite(rightPartTexture)
		const statAttackClaw = new PIXI.Sprite(TextureAtlas.getTexture('components/stat-attack-claw'))

		if (this.displayMode === CardDisplayMode.IN_HAND) {
			bgStatsLeft.position.y -= 2
			bgStatsRight.position.y -= 2
			bgStatsMiddle.position.y -= 2
		} else {
			bgStatsLeft.position.x += 1
			bgStatsRight.position.x += 1
			bgStatsMiddle.position.x += 1
		}
		bgStatsLeft.position.x += 2 - width
		bgStatsMiddle.position.x += rightPartTexture.width - 40 - width
		bgStatsMiddle.width = width
		statAttackClaw.position.x -= width + 5

		this.addChild(bgStatsLeft)
		this.addChild(bgStatsMiddle)
		this.addChild(bgStatsRight)
		this.addChild(statAttackClaw)
	}

	public getCardAttributesWidth(): number {
		const attack = this.card.attack || 0
		const attackTextWidth = PIXI.TextMetrics.measureText(attack.toString(), new PIXI.TextStyle({
			fontFamily: 'BrushScript',
			fontSize: 60
		})).width
		return (attackTextWidth - 0) * this.scale.x
	}

	public getAttackTextFontSize(): number {
		return this.displayMode === CardDisplayMode.IN_HAND ? 60 : 110
	}

	public getAttackTextPosition(): PIXI.Point {
		if (this.displayMode === CardDisplayMode.IN_HAND) {
			return new PIXI.Point(-20, -33)
		} else {
			return new PIXI.Point(-35, -58)
		}
	}
}
