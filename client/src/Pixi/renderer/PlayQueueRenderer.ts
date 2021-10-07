import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'
import { CardDisplayMode } from '@/Pixi/enums/CardDisplayMode'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import { CARD_ASPECT_RATIO, getScreenHeight, RESOLVING_CARD_ZINDEX } from '@/Pixi/renderer/RendererUtils'

class PlayQueueRenderer {
	public tick(): void {
		this.renderPlayQueue()
	}

	public renderPlayQueue(): void {
		const invertedStack = Core.resolveStack.cards.slice()
		const playersStack = invertedStack.filter((card) => Core.player.includes(card.owner))
		for (let i = 0; i < playersStack.length; i++) {
			const ownedCard = playersStack[i]
			this.renderPlayQueueCard(ownedCard.card, ownedCard.owner, i)
		}
		const opponentsStack = invertedStack.filter((card) => !Core.player.includes(card.owner))
		for (let i = 0; i < opponentsStack.length; i++) {
			const ownedCard = opponentsStack[i]
			this.renderPlayQueueCard(ownedCard.card, ownedCard.owner, i)
		}
		Core.resolveStack.discardedCards.forEach((discardedCard) => {
			this.renderDiscardedPlayQueueCard(discardedCard.card, discardedCard.owner, discardedCard.index)
		})
	}

	public renderPlayQueueCard(card: RenderedCard, owner: ClientPlayerInGame, index: number): void {
		const container = card.coreContainer
		const sprite = card.sprite
		sprite.alpha = 1
		sprite.scale.set(Core.renderer.superSamplingLevel)
		container.visible = true
		container.zIndex = RESOLVING_CARD_ZINDEX + index

		const cardHeight = getScreenHeight() * Core.renderer.PLAYER_HAND_WINDOW_FRACTION
		sprite.width = cardHeight * CARD_ASPECT_RATIO
		sprite.height = cardHeight

		const horizontalOffset = 50 * Core.renderer.superSamplingLevel * index

		let verticalOffset = getScreenHeight() * 0.2
		if (Core.opponent.includes(owner)) {
			verticalOffset *= -1
		}

		if (card.displayMode !== CardDisplayMode.RESOLVING) {
			container.position.x = -sprite.width / 2 + horizontalOffset
			container.position.y = getScreenHeight() / 2 + verticalOffset
			container.alpha = 0
			card.setDisplayMode(CardDisplayMode.RESOLVING)
		} else {
			const targetX = sprite.width / 2 + 50 * Core.renderer.superSamplingLevel + horizontalOffset

			if (container.alpha < 1) {
				container.alpha += Core.renderer.deltaTimeFraction * 5
			}

			container.position.x += (targetX - container.position.x) * Core.renderer.deltaTimeFraction * 7
			container.position.y = getScreenHeight() / 2 + verticalOffset
		}

		const hitboxSprite = card.hitboxSprite
		hitboxSprite.position.set(container.position.x + sprite.position.x, container.position.y + sprite.position.y)
		hitboxSprite.scale = sprite.scale
		hitboxSprite.zIndex = container.zIndex - 1

		card.cardTintOverlay.alpha = 0
		card.cardFullTintOverlay.alpha = 0
	}

	public renderDiscardedPlayQueueCard(card: RenderedCard, owner: ClientPlayerInGame, index: number): void {
		const container = card.coreContainer
		const sprite = card.sprite

		const cardHeight = getScreenHeight() * Core.renderer.PLAYER_HAND_WINDOW_FRACTION
		sprite.width = cardHeight * CARD_ASPECT_RATIO
		sprite.height = cardHeight

		container.alpha -= Core.renderer.deltaTimeFraction * 5

		const horizontalOffset = 50 * Core.renderer.superSamplingLevel * index
		const targetX = sprite.width / 2 + 50 * Core.renderer.superSamplingLevel + horizontalOffset + (cardHeight * CARD_ASPECT_RATIO) / 4
		container.position.x += (targetX - container.position.x) * Core.renderer.deltaTimeFraction * 7

		const hitboxSprite = card.hitboxSprite
		hitboxSprite.position.set(container.position.x + sprite.position.x, container.position.y + sprite.position.y)
		hitboxSprite.scale = sprite.scale
		hitboxSprite.zIndex = container.zIndex - 1

		card.cardTintOverlay.alpha = 0
		card.cardFullTintOverlay.alpha = 0
	}
}

export const playQueueRenderer = new PlayQueueRenderer()
