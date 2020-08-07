import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import {CardDisplayMode} from '@/Pixi/enums/CardDisplayMode'
import {CARD_ASPECT_RATIO, getScreenHeight, getScreenWidth, INSPECTED_CARD_ZINDEX} from '@/Pixi/renderer/RendererUtils'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import RichText from '@/Pixi/render/RichText'
import RichTextAlign from '@/Pixi/render/RichTextAlign'
import store from '@/Vue/store'

export const INSPECTED_CARD_WINDOW_FRACTION = 0.40

class InspectedCardRenderer {
	public container: PIXI.Container = new PIXI.Container()

	private richText: RichText

	constructor() {
		this.container.zIndex = INSPECTED_CARD_ZINDEX
	}

	public init(): void {
		this.richText = new RichText('', 500, {})
		this.richText.style.fontSize = 20
		this.richText.horizontalAlign = RichTextAlign.START
		this.richText.verticalAlign = RichTextAlign.START

		this.container.addChild(this.richText)
	}

	public tick(): void {
		this.container.visible = !!Core.input.inspectedCard
		if (Core.input.inspectedCard) {
			this.renderInspectedCard(Core.input.inspectedCard)
		}
	}

	public renderInspectedCard(inspectedCard: RenderedCard): void {
		const container = inspectedCard.coreContainer
		const sprite = inspectedCard.sprite
		const disabledOverlaySprite = inspectedCard.cardDisabledOverlay

		sprite.tint = 0xFFFFFF
		sprite.alpha = 1

		const cardHeight = getScreenHeight() * INSPECTED_CARD_WINDOW_FRACTION
		sprite.width = cardHeight * CARD_ASPECT_RATIO
		sprite.height = cardHeight

		container.position.x = getScreenWidth() / 2
		container.position.y = getScreenHeight() / 2
		container.zIndex = INSPECTED_CARD_ZINDEX

		inspectedCard.setDisplayMode(CardDisplayMode.INSPECTED)

		disabledOverlaySprite.visible = false
	}
}

export const inspectedCardRenderer = new InspectedCardRenderer()
