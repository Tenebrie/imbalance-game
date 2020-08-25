import * as PIXI from 'pixi.js'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import Card from '@shared/models/Card'
import { CardDisplayMode } from '@/Pixi/enums/CardDisplayMode'

export default class CardAttributes extends PIXI.Container {
	private card: Card
	private readonly displayMode: CardDisplayMode

	private readonly renderedElements: PIXI.DisplayObject[]
	private statAttackClaw?: PIXI.Sprite
	private statAttackRange?: PIXI.Sprite
	private statHealthArmor?: PIXI.Sprite

	public constructor(card: Card, displayMode: CardDisplayMode) {
		super()
		this.card = card
		this.displayMode = displayMode
		this.renderedElements = []
		this.updateChildren()

		if (displayMode === CardDisplayMode.ON_BOARD) {
			this.scale.set(1.75)
		}
	}

	public updateChildren(): void {
		while (this.children.length > 0) {
			this.removeChildAt(0)
		}

		const width = Math.round(this.getCardAttributesWidth())

		const leftPartTexture = TextureAtlas.getTexture('components/bg-stats-left')
		let rightPartTexture = TextureAtlas.getTexture('components/bg-stats-right')
		const middlePartTexture = TextureAtlas.getTexture('components/bg-stats-middle')
		if (this.displayMode === CardDisplayMode.ON_BOARD) {
			rightPartTexture = TextureAtlas.getTexture('components/bg-stats-right-zoom')
		}

		const bgStatsLeft = new PIXI.Sprite(leftPartTexture)
		const bgStatsMiddle = new PIXI.TilingSprite(middlePartTexture, middlePartTexture.width, middlePartTexture.height)
		const bgStatsRight = new PIXI.Sprite(rightPartTexture)

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

		this.addChild(bgStatsLeft)
		this.addChild(bgStatsMiddle)
		this.addChild(bgStatsRight)

		let cumulativeOffset = 0

		if (this.card.armor > 0 && this.displayMode === CardDisplayMode.IN_HAND) {
			this.statHealthArmor = new PIXI.Sprite(TextureAtlas.getTexture('components/stat-health-armor'))
			this.statHealthArmor.position.x = -cumulativeOffset
			cumulativeOffset += 50
			this.renderedElements.push(this.statHealthArmor)
		}

		if (this.card.attackRange !== 1 && this.displayMode === CardDisplayMode.IN_HAND) {
			this.statAttackRange = new PIXI.Sprite(TextureAtlas.getTexture('components/stat-attack-range'))
			this.statAttackRange.position.x = -cumulativeOffset
			cumulativeOffset += 50
			this.renderedElements.push(this.statAttackRange)
		}

		this.statAttackClaw = new PIXI.Sprite(TextureAtlas.getTexture('components/stat-attack-claw'))
		this.statAttackClaw.position.x = -cumulativeOffset - this.getAttackTextWidth() - 10
		this.statAttackClaw.position.y = -1
		this.renderedElements.push(this.statAttackClaw)

		this.renderedElements.forEach(renderedElement => this.addChild(renderedElement))
	}

	private getAttackTextWidth(): number {
		const attack = this.card.attack || 0
		return PIXI.TextMetrics.measureText(attack.toString(), new PIXI.TextStyle({
			fontFamily: 'BrushScript',
			fontSize: 60
		})).width
	}

	public getCardAttributesWidth(): number {
		const attackTextWidth = this.getAttackTextWidth()
		const attackRangeWidth = this.card.attackRange !== 1 && this.displayMode === CardDisplayMode.IN_HAND ? 50 : 0
		const healthArmorWidth = this.card.armor > 0 && this.displayMode === CardDisplayMode.IN_HAND ? 50 : 0
		return (attackTextWidth + attackRangeWidth + healthArmorWidth + 5) * this.scale.x
	}
}
