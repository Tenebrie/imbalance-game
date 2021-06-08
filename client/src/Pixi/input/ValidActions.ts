import RenderedCard from '@/Pixi/cards/RenderedCard'
import RenderedGameBoardRow from '@/Pixi/cards/RenderedGameBoardRow'
import Core from '@/Pixi/Core'
import { getCardInsertIndex } from '@/utils/Utils'
import MouseHover from './MouseHover'

export const isCardPlayable = (card: RenderedCard): boolean => {
	return (
		Core.player.isTurnActive &&
		!Core.input.forcedTargetingMode &&
		!!Core.input.playableCards.find((target) => card && target.sourceCardId === card.id) &&
		Core.resolveStack.cards.length === 0
	)
}

export const isGrabbedCardPlayableToRow = (row: RenderedGameBoardRow | null): boolean => {
	console.log(
		(Core.input.grabbedCard &&
			row &&
			isCardPlayable(Core.input.grabbedCard.card) &&
			Core.input.grabbedCard.validTargetPositions.some((target) => target.row === row)) ||
			false
	)
	return (
		(Core.input.grabbedCard &&
			row &&
			isCardPlayable(Core.input.grabbedCard.card) &&
			Core.input.grabbedCard.validTargetPositions.some((target) => target.row === row)) ||
		false
	)
}

export const isGrabbedCardPlayableToHoveredPosition = (): boolean => {
	const row = MouseHover.getHoveredRow()
	const insertIndex = getCardInsertIndex(row)
	return (
		(Core.input.grabbedCard &&
			row &&
			isCardPlayable(Core.input.grabbedCard.card) &&
			Core.input.grabbedCard.validTargetPositions.some((target) => target.row === row && target.position === insertIndex)) ||
		false
	)
}
