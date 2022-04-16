enum GameEventType {
	GAME_CREATED = 'gameCreated',
	GAME_SETUP = 'gameSetup',
	POST_GAME_SETUP = 'postGameSetup',
	GAME_STARTED = 'gameStarted',

	ROUND_STARTED = 'roundStarted',
	POST_ROUND_STARTED = 'postRoundStarted',
	TURN_STARTED = 'turnStarted',

	CARD_REVEALED = 'cardRevealed',

	CARD_DRAWN = 'cardDrawn',
	CARD_RETURNED = 'cardReturned',
	CARD_PLAYED = 'cardPlayed',
	CARD_PRE_RESOLVED = 'cardPreResolved',
	CARD_RESOLVED = 'cardResolved',
	BEFORE_CARD_TAKES_DAMAGE = 'beforeCardTakesDamage',
	CARD_TAKES_DAMAGE = 'cardTakesDamage',
	CARD_POWER_RESTORED = 'cardPowerRestored',
	CARD_ARMOR_RESTORED = 'cardArmorRestored',
	CARD_DISCARDED = 'cardDiscarded',
	CARD_DESTROYED = 'cardDestroyed',

	CARD_TARGET_SELECTED_CARD = 'cardTargetSelectedCard',
	CARD_TARGET_SELECTED_UNIT = 'cardTargetSelectedUnit',
	CARD_TARGET_SELECTED_ROW = 'cardTargetSelectedRow',
	CARD_TARGET_SELECTED_POSITION = 'cardTargetSelectedPosition',
	CARD_TARGETS_CONFIRMED = 'cardTargetsConfirmed',

	PLAYER_TARGET_SELECTED_CARD = 'playerTargetSelectedCard',
	PLAYER_TARGETS_CONFIRMED = 'playerTargetConfirmed',

	UNIT_CREATED = 'unitCreated',
	UNIT_MOVED = 'unitMoved',
	UNIT_ORDERED_CARD = 'unitOrderedCard',
	UNIT_ORDERED_UNIT = 'unitOrderedUnit',
	UNIT_ORDERED_ROW = 'unitOrderedRow',
	UNIT_ORDERED_POSITION = 'unitOrderedPosition',
	UNIT_CONSUMED = 'unitConsumed',
	UNIT_DESTROYED = 'unitDestroyed',
	AFTER_UNIT_DESTROYED = 'afterUnitDestroyed',

	UNIT_NIGHTFALL = 'unitNightfall',

	UNIT_DEPLOYED = 'unitDeployed',
	SPELL_DEPLOYED = 'spellDeployed',

	CARD_BUFF_CREATED = 'cardBuffCreated',
	CARD_BUFF_REMOVED = 'cardBuffRemoved',
	ROW_BUFF_CREATED = 'rowBuffCreated',
	ROW_BUFF_REMOVED = 'rowBuffRemoved',
	CARD_MULTIBUFF_CREATED = 'cardMultibuffCreated',

	SPELL_MANA_GENERATED = 'spellManaGenerated',

	TURN_ENDED = 'turnEnded',
	ROUND_ENDED = 'roundEnded',

	GAME_FINISHED = 'gameFinished',
}

export default GameEventType
