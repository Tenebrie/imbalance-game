enum GameEventType {
	EFFECT_UNIT_DEPLOY = 'effectUnitDeploy',
	EFFECT_SPELL_PLAY = 'effectSpellPlay',
	EFFECT_TARGET_SELECTED = 'effectTargetSelected',
	EFFECT_TARGETS_CONFIRMED = 'effectTargetsConfirmed',

	CARD_PLAYED = 'cardPlayed',
	CARD_RESOLVED = 'cardResolved',
	CARD_TAKES_DAMAGE = 'cardTakesDamage',
	CARD_DESTROYED = 'cardDestroyed',
	UNIT_CREATED = 'unitCreated',
	UNIT_DESTROYED = 'unitDestroyed',
}

export default GameEventType
