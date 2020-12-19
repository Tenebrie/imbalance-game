import RenderedCard from '@/Pixi/cards/RenderedCard'
import RenderedGameBoardRow from '@/Pixi/cards/RenderedGameBoardRow'
import Core from '@/Pixi/Core'

export const isCardPlayable = (card: RenderedCard): boolean => {
	return Core.player.isTurnActive &&
		!Core.input.forcedTargetingMode &&
		!!Core.input.playableCards.find(target => card && target.sourceCardId === card.id)
}

export const isGrabbedCardPlayableToRow = (row: RenderedGameBoardRow | null): boolean => {
	return Core.input.grabbedCard && row && isCardPlayable(Core.input.grabbedCard.card) && Core.input.grabbedCard.validTargetRows.includes(row)
}