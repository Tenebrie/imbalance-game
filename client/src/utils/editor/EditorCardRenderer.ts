import * as PIXI from 'pixi.js'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardMessage from '@shared/models/network/CardMessage'
import { CardDisplayMode } from '@/Pixi/enums/CardDisplayMode'
import store from '@/Vue/store'
import {CARD_HEIGHT, CARD_WIDTH} from '@/Pixi/renderer/RendererUtils'
import Core from '@/Pixi/Core'
import Card from '@shared/models/Card'

class EditorCardRenderer {
	pixi: PIXI.Renderer
	renderTexture: PIXI.RenderTexture
	mainTimer: number | null = null

	public constructor() {
		this.pixi = PIXI.autoDetectRenderer()
		this.renderTexture = PIXI.RenderTexture.create({
			width: CARD_WIDTH,
			height: CARD_HEIGHT,
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
			const nextCardClass = store.state.editor.renderQueue[0]
			if (!nextCardClass) {
				return
			}

			store.commit.editor.shiftRenderQueue()
			const nextCard = store.state.editor.cardLibrary.find(card => card.class === nextCardClass)
			if (!nextCard) {
				return
			}

			store.commit.editor.addRenderedCard({
				class: nextCard.class,
				render: this.doRender(nextCard)
			})
		}, 0)
	}

	private doRender(card: CardMessage): HTMLImageElement {
		const renderedCard = new RenderedCard(card)
		renderedCard.setDisplayMode(CardDisplayMode.IN_EDITOR)

		renderedCard.coreContainer.position.set(CARD_WIDTH / 2, CARD_HEIGHT / 2)

		renderedCard.sprite.alpha = 1
		renderedCard.coreContainer.visible = true
		this.pixi.render(renderedCard.coreContainer, this.renderTexture)

		return this.pixi.extract.image(this.renderTexture)
	}
}

export const editorCardRenderer = new EditorCardRenderer()
