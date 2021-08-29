import * as PIXI from 'pixi.js'

import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'
import { CardDisplayMode } from '@/Pixi/enums/CardDisplayMode'
import RichText from '@/Pixi/render/RichText'
import RichTextAlign from '@/Pixi/render/RichTextAlign'
import { CARD_ASPECT_RATIO, CARD_HEIGHT, getScreenHeight, getScreenWidth, INSPECTED_CARD_ZINDEX } from '@/Pixi/renderer/RendererUtils'

class InspectedCardRenderer {
	public container!: PIXI.Container

	private richText!: RichText

	public init(): void {
		this.container = new PIXI.Container()
		this.container.zIndex = INSPECTED_CARD_ZINDEX
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

		sprite.tint = 0xffffff
		sprite.alpha = 1

		const cardHeight = CARD_HEIGHT * Core.renderer.superSamplingLevel * window.devicePixelRatio
		sprite.width = cardHeight * CARD_ASPECT_RATIO
		sprite.height = cardHeight

		container.position.x = getScreenWidth() / 2 - sprite.width / 2
		container.position.y = getScreenHeight() / 2
		container.zIndex = INSPECTED_CARD_ZINDEX

		inspectedCard.setDisplayMode(CardDisplayMode.INSPECTED)

		inspectedCard.cardTintOverlay.visible = false
		inspectedCard.cardFullTintOverlay.visible = false
	}
}

export const inspectedCardRenderer = new InspectedCardRenderer()
