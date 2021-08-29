import { LabyrinthProgressionMetaState, LabyrinthProgressionRunState } from '@shared/models/progression/LabyrinthProgressionState'
import SpellLabyrinthRewardCard from '@src/game/cards/12-labyrinth/actions/rewards/SpellLabyrinthRewardCard'
import {
	SpellLabyrinthRewardTreasureT1,
	SpellLabyrinthRewardTreasureT2,
	SpellLabyrinthRewardTreasureT3,
} from '@src/game/cards/12-labyrinth/actions/rewards/SpellLabyrinthRewardTreasure'
import { SpellLabyrinthRewardUpgradeAny } from '@src/game/cards/12-labyrinth/actions/rewards/SpellLabyrinthRewardUpgrade'
import { CardConstructor } from '@src/game/libraries/CardLibrary'

type Props = {
	run: LabyrinthProgressionRunState
	meta: LabyrinthProgressionMetaState
}

type ReturnValue = {
	cardsInHand: { card: CardConstructor; count: number }[]
}

const cardsInHand = (cards: (CardConstructor | { card: CardConstructor; count: number })[]): ReturnValue => {
	const normalizedCards = cards.map((card) => {
		return typeof card === 'function' ? { card, count: 1 } : card
	})

	return {
		cardsInHand: normalizedCards,
	}
}

export const getReward = (state: Props): ReturnValue => {
	// Starting cards
	if (state.meta.runCount > 0 && state.run.encounterHistory.length === 0) {
		return cardsInHand([SpellLabyrinthRewardCard])
	}

	const encounterIndex = state.run.encounterHistory.length
	switch (encounterIndex) {
		case 1:
			return cardsInHand([SpellLabyrinthRewardCard, SpellLabyrinthRewardUpgradeAny, SpellLabyrinthRewardTreasureT1])
		case 2:
			return cardsInHand([SpellLabyrinthRewardCard, SpellLabyrinthRewardUpgradeAny])
		case 3:
			return cardsInHand([SpellLabyrinthRewardCard, SpellLabyrinthRewardUpgradeAny, SpellLabyrinthRewardTreasureT2])
		case 4:
			return cardsInHand([SpellLabyrinthRewardCard, SpellLabyrinthRewardUpgradeAny])
		case 5:
			return cardsInHand([SpellLabyrinthRewardCard, SpellLabyrinthRewardUpgradeAny, SpellLabyrinthRewardTreasureT3])
	}

	return cardsInHand([])
}
