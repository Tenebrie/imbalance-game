import BoardSplitMode from '../enums/BoardSplitMode'

export type RulesetConstants = {
	STARTING_PLAYER_MORALE: number
	UNIT_HAND_SIZE_LIMIT: number
	UNIT_HAND_SIZE_STARTING: number
	UNIT_HAND_SIZE_PER_ROUND: number
	SPELL_HAND_SIZE_MINIMUM: number
	SPELL_HAND_SIZE_LIMIT: number
	SPELL_MANA_PER_ROUND: number
	MULLIGAN_INITIAL_CARD_COUNT: number
	MULLIGAN_ROUND_CARD_COUNT: number

	GAME_BOARD_ROW_COUNT: number
	GAME_BOARD_ROW_SPLIT_MODE: BoardSplitMode
}
