enum GameEventType {
	ROUND_STARTED = 'roundStarted',
	TURN_STARTED = 'turnStarted',

	CARD_DRAWN = 'cardDrawn',
	CARD_PLAYED = 'cardPlayed',
	CARD_RESOLVED = 'cardResolved',
	CARD_TAKES_DAMAGE = 'cardTakesDamage',
	CARD_DESTROYED = 'cardDestroyed',

	CARD_TARGET_SELECTED = 'effectTargetSelected',
	CARD_TARGETS_CONFIRMED = 'effectTargetsConfirmed',

	UNIT_CREATED = 'unitCreated',
	UNIT_MOVED = 'unitMoved',
	UNIT_ORDERED = 'unitOrdered',
	UNIT_DESTROYED = 'unitDestroyed',

	UNIT_DEPLOYED = 'unitDeployed',
	SPELL_DEPLOYED = 'spellDeployed',

	BUFF_CREATED = 'buffCreated',
	BUFF_REMOVED = 'buffRemoved',

	TURN_ENDED = 'turnEnded',
	ROUND_ENDED = 'roundEnded',
}

export default GameEventType
