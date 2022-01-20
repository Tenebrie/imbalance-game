import RenderedCard from '@/Pixi/cards/RenderedCard'
import RenderedGameBoardRow from '@/Pixi/cards/RenderedGameBoardRow'
import Core from '@/Pixi/Core'
import store from '@/Vue/store'

export const isCardPlayable = (card: RenderedCard): boolean => {
	return (
		!store.state.novel.isActive &&
		Core.player.isTurnActive &&
		!Core.input.forcedTargetingMode &&
		!!Core.input.playableCards.find((target) => card && target.sourceCardId === card.id) &&
		Core.resolveStack.cards.length === 0
	)
}

export const isGrabbedCardPlayableToRow = (row: RenderedGameBoardRow | null): boolean => {
	return (
		(!store.state.novel.isActive &&
			Core.input.grabbedCard &&
			row &&
			isCardPlayable(Core.input.grabbedCard.card) &&
			Core.input.grabbedCard.validTargetPositions.some((target) => target.row === row)) ||
		false
	)
}
