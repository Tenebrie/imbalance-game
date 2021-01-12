enum GameEventType {
	GAME_STARTED = 'gameStarted',

	ROUND_STARTED = 'roundStarted',
	TURN_STARTED = 'turnStarted',

	CARD_DRAWN = 'cardDrawn',
	CARD_PLAYED = 'cardPlayed',
	CARD_RESOLVED = 'cardResolved',
	CARD_TAKES_DAMAGE = 'cardTakesDamage',
	CARD_DISCARDED = 'cardDiscarded',
	CARD_DESTROYED = 'cardDestroyed',

	CARD_TARGET_SELECTED_CARD = 'cardTargetSelectedCard',
	CARD_TARGET_SELECTED_UNIT = 'cardTargetSelectedUnit',
	CARD_TARGET_SELECTED_ROW = 'cardTargetSelectedRow',
	CARD_TARGETS_CONFIRMED = 'cardTargetsConfirmed',

	PLAYER_TARGET_SELECTED_CARD = 'playerTargetSelectedCard',
	PLAYER_TARGETS_CONFIRMED = 'playerTargetConfirmed',

	UNIT_CREATED = 'unitCreated',
	UNIT_MOVED = 'unitMoved',
	UNIT_ORDERED_CARD = 'unitOrderedCard',
	UNIT_ORDERED_UNIT = 'unitOrderedUnit',
	UNIT_ORDERED_ROW = 'unitOrderedRow',
	UNIT_DESTROYED = 'unitDestroyed',

	UNIT_DEPLOYED = 'unitDeployed',
	SPELL_DEPLOYED = 'spellDeployed',

	BUFF_CREATED = 'buffCreated',
	BUFF_REMOVED = 'buffRemoved',

	TURN_ENDED = 'turnEnded',
	ROUND_ENDED = 'roundEnded',
}

export default GameEventType
