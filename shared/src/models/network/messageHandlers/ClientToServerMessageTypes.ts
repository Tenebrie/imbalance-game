export enum GenericActionMessageType {
	CARD_PLAY = 'genericAction_cardPlay',
	UNIT_ORDER = 'genericAction_unitOrder',
	CARD_TARGET = 'genericAction_cardTarget',
	TURN_END = 'genericAction_turnEnd',
}

export enum SystemMessageType {
	INIT = 'system_init',
	KEEPALIVE = 'system_keepAlive'
}

export type ClientToServerMessageTypes = GenericActionMessageType | SystemMessageType
