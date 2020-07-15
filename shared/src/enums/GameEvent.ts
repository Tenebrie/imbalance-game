enum GameEvent {
	EFFECT_UNIT_DEPLOY = 'effectUnitDeploy',
	EFFECT_SPELL_PLAY = 'effectSpellPlay',

	CARD_PLAYED = 'cardPlayed',
	CARD_TAKES_DAMAGE = 'cardTakesDamage',
	CARD_DESTROYED = 'cardDestroyed',
	UNIT_CREATED = 'unitCreated',
	UNIT_DESTROYED = 'unitDestroyed',
}

export default GameEvent

export interface CardPlayedEventArgsMessage {
	owner: string
	triggeringCard: string
}

export interface CardTakesDamageEventArgsMessage {
	triggeringCard: string
}

export interface CardDestroyedEventArgsMessage {
	triggeringCard: string
}

export interface UnitCreatedEventArgsMessage {
	triggeringUnit: string
}

export interface UnitDestroyedEventArgsMessage {
	triggeringUnit: string
}
