import CardMessage from '@shared/models/network/card/CardMessage'
import * as PIXI from 'pixi.js'
import { SCALE_MODES } from 'pixi.js'

import RenderedCard from '@/Pixi/cards/RenderedCard'
import { CardDisplayMode } from '@/Pixi/enums/CardDisplayMode'
import { RichTextTooltip } from '@/Pixi/render/RichText'
import { CARD_HEIGHT, CARD_WIDTH } from '@/Pixi/renderer/RendererUtils'
import { getCardMessageKey } from '@/utils/Utils'
import store from '@/Vue/store'

export type WorkshopCardProps = {
	workshopTitle: string
	workshopImage: PIXI.Texture
	workshopTribes: string[]
}

class EditorCardRenderer {
	pixi: PIXI.Renderer
	renderTexture: PIXI.RenderTexture
	mainTimer: number | null = null

	public constructor() {
		this.pixi = new PIXI.Renderer({
			resolution: window.devicePixelRatio,
		})
		this.renderTexture = PIXI.RenderTexture.create({
			width: CARD_WIDTH,
			height: CARD_HEIGHT,
			scaleMode: SCALE_MODES.LINEAR,
		})
		this.preloadFonts()
	}

	private preloadFonts(): void {
		const text = new PIXI.Text(
			'',
			new PIXI.TextStyle({
				fontFamily: 'BrushScript',
			})
		)
		this.pixi.render(text, this.renderTexture)
	}

	public startRenderingService(): void {
		if (this.mainTimer !== null) {
			return
		}

		this.mainTimer = window.setInterval(() => {
			if (store.state.editor.renderQueue.length === 0) {
				return
			}

			const nextEntry = store.state.editor.renderQueue[0]
			store.commit.editor.shiftRenderQueue()

			const renderResult = this.doRender(nextEntry)
			store.commit.editor.addRenderedCard({
				key: getCardMessageKey(nextEntry),
				class: nextEntry.class,
				render: renderResult.canvas,
				tooltips: renderResult.tooltips,
			})
			while (store.state.editor.renderedCards.length > 250) {
				store.commit.editor.removeOldestRenderedCard()
			}
		}, 0)
	}

	public doRender(
		card: CardMessage & Partial<WorkshopCardProps>,
		hideArtwork = false
	): { canvas: HTMLCanvasElement; tooltips: RichTextTooltip[] } {
		const renderedCard = new RenderedCard(card)
		renderedCard.setDisplayMode(CardDisplayMode.IN_EDITOR)

		renderedCard.coreContainer.position.set(CARD_WIDTH / 2, CARD_HEIGHT / 2)

		renderedCard.sprite.alpha = 1
		if (hideArtwork) {
			renderedCard.artwork.alpha = 0
		}
		renderedCard.coreContainer.visible = true
		this.pixi.render(renderedCard.coreContainer, this.renderTexture)

		return {
			canvas: this.pixi.plugins.extract.canvas(this.renderTexture),
			tooltips: renderedCard.tooltips,
		}
	}
}

export const editorCardRenderer = new EditorCardRenderer()
