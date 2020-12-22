enum TargetType {
	UNIT,
	BOARD_ROW,
	CARD_IN_LIBRARY,
	CARD_IN_UNIT_HAND,
	CARD_IN_SPELL_HAND,
	CARD_IN_UNIT_DECK,
	CARD_IN_SPELL_DECK,
}

export default TargetType
export type CardTargetTypes =
	| TargetType.UNIT
	| TargetType.CARD_IN_LIBRARY
	| TargetType.CARD_IN_UNIT_DECK
	| TargetType.CARD_IN_SPELL_DECK
	| TargetType.CARD_IN_UNIT_HAND
	| TargetType.CARD_IN_SPELL_HAND
