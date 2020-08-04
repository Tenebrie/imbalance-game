import * as PIXI from 'pixi.js'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardMessage from '@shared/models/network/CardMessage'
import { CardDisplayMode } from '@/Pixi/enums/CardDisplayMode'
import store from '@/Vue/store'

class EditorCardRenderer {
	pixi: PIXI.Renderer
	renderTexture: PIXI.RenderTexture
	mainTimer: number | null = null

	public constructor() {
		this.pixi = PIXI.autoDetectRenderer()
		this.renderTexture = PIXI.RenderTexture.create({
			width: 408,
			height: 584,
		})
		this.preloadFonts()
	}

	private preloadFonts(): void {
		const text = new PIXI.Text('', new PIXI.TextStyle({
			fontFamily: 'BrushScript'
		}))
		this.pixi.render(text, this.renderTexture)
	}

	public startRenderingService(): void {
		if (this.mainTimer !== null) {
			return
		}

		this.mainTimer = window.setInterval(() => {
			const nextCard = store.state.editor.renderQueue[0]
			if (!nextCard) {
				return
			}

			store.commit.editor.shiftRenderQueue()
			store.commit.editor.addRenderedCard({
				id: nextCard.id,
				render: this.doRender(nextCard)
			})
		}, 0)
	}

	public stopRenderingService(): void {
		window.clearInterval(this.mainTimer)
		this.mainTimer = null
	}

	private doRender(card: CardMessage): HTMLImageElement {
		const renderedCard = new RenderedCard(card)
		renderedCard.setDisplayMode(CardDisplayMode.IN_EDITOR)

		renderedCard.coreContainer.position.set(408 / 2, 584 / 2)

		renderedCard.sprite.alpha = 1
		renderedCard.coreContainer.visible = true
		this.pixi.render(renderedCard.coreContainer, this.renderTexture)

		return this.pixi.extract.image(this.renderTexture)
	}
}

export const editorCardRenderer = new EditorCardRenderer()
