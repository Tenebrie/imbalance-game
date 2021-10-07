import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'
import { CardDisplayMode } from '@/Pixi/enums/CardDisplayMode'
import { ANNOUNCED_CARD_ZINDEX, CARD_ASPECT_RATIO, getScreenHeight } from '@/Pixi/renderer/RendererUtils'

class AnnouncedCardRenderer {
	public tick(): void {
		if (Core.mainHandler.previousAnnouncedCard) {
			this.renderAnnouncedCard(Core.mainHandler.previousAnnouncedCard, 'previous')
		}
		if (Core.mainHandler.announcedCard) {
			this.renderAnnouncedCard(Core.mainHandler.announcedCard, 'current')
		}
	}

	public renderAnnouncedCard(announcedCard: RenderedCard, mode: 'current' | 'previous'): void {
		const container = announcedCard.coreContainer
		const sprite = announcedCard.sprite

		sprite.alpha = 1
		sprite.scale.set(Core.renderer.superSamplingLevel)
		container.visible = true
		container.zIndex = ANNOUNCED_CARD_ZINDEX

		const cardHeight = getScreenHeight() * Core.renderer.ANNOUNCED_CARD_WINDOW_FRACTION
		sprite.width = cardHeight * CARD_ASPECT_RATIO
		sprite.height = cardHeight

		if (announcedCard.displayMode !== CardDisplayMode.ANNOUNCED) {
			container.position.x = (-sprite.width / 2) * Core.renderer.superSamplingLevel
			container.position.y = getScreenHeight() / 2
			container.alpha = 0
			announcedCard.setDisplayMode(CardDisplayMode.ANNOUNCED)
		} else {
			const targetX = sprite.width / 2 + 50 * Core.renderer.superSamplingLevel
			let targetY = getScreenHeight() / 2

			if (mode === 'current' && container.alpha < 1) {
				container.alpha += Core.renderer.deltaTimeFraction * 5
			} else if (mode === 'previous') {
				targetY -= cardHeight / 4
				container.alpha -= Core.renderer.deltaTimeFraction * 5
			}

			container.position.x += (targetX - container.position.x) * Core.renderer.deltaTimeFraction * 7
			container.position.y += (targetY - container.position.y) * Core.renderer.deltaTimeFraction * 7
		}

		const hitboxSprite = announcedCard.hitboxSprite
		hitboxSprite.position.set(container.position.x + sprite.position.x, container.position.y + sprite.position.y)
		hitboxSprite.scale = sprite.scale
		hitboxSprite.zIndex = container.zIndex - 1

		announcedCard.cardTintOverlay.visible = false
		announcedCard.cardFullTintOverlay.visible = false
	}
}

export const announcedCardRenderer = new AnnouncedCardRenderer()
