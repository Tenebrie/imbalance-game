import * as PIXI from 'pixi.js'
import RenderedCard from '@/Pixi/board/RenderedCard'
import CardMessage from '@shared/models/network/CardMessage'
import { CardDisplayMode } from '@/Pixi/enums/CardDisplayMode'

class EditorCardRenderer {
	pixi: PIXI.Renderer
	renderTexture: PIXI.RenderTexture

	public constructor() {
		this.pixi = PIXI.autoDetectRenderer()
		this.renderTexture = PIXI.RenderTexture.create({
			width: 408,
			height: 584,
		})
		this.preloadFonts()
	}

	public preloadFonts(): void {
		const text = new PIXI.Text('', new PIXI.TextStyle({
			fontFamily: 'BrushScript'
		}))
		this.pixi.render(text, this.renderTexture)
	}

	public render(card: CardMessage): HTMLImageElement {
		const renderedCard = new RenderedCard(card)
		renderedCard.setDisplayMode(CardDisplayMode.IN_HAND)

		renderedCard.coreContainer.position.set(408 / 2, 584 / 2)

		renderedCard.sprite.alpha = 1
		renderedCard.coreContainer.visible = true
		this.pixi.render(renderedCard.coreContainer, this.renderTexture)

		return this.pixi.extract.image(this.renderTexture)
	}
}

export const editorCardRenderer = new EditorCardRenderer()
