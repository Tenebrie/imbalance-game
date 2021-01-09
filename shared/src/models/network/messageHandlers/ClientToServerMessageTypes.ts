export enum GenericActionMessageType {
	CARD_PLAY = 'genericAction_cardPlay',
	UNIT_ORDER = 'genericAction_unitOrder',
	CARD_TARGET = 'genericAction_cardTarget',
	ANONYMOUS_TARGET = 'genericAction_anonymousTarget',
	CONFIRM_TARGETS = 'genericAction_confirmTargets',
	REQUEST_PLAYERS_DECK = 'genericAction_requestPlayersDeck',
	REQUEST_PLAYERS_GRAVEYARD = 'genericAction_requestPlayersGraveyard',
	REQUEST_OPPONENTS_GRAVEYARD = 'genericAction_requestOpponentsGraveyard',
	TURN_END = 'genericAction_turnEnd',
	SURRENDER = 'genericAction_surrender',
}

export enum SystemMessageType {
	INIT = 'system_init',
	KEEPALIVE = 'system_keepAlive',
}

export type ClientToServerMessageTypes = GenericActionMessageType | SystemMessageType
export type ClientToServerSpectatorMessageTypes = SystemMessageType
