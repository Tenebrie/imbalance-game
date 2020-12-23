export enum PlayerUpdateMessageType {
	LEADER_SELF = 'playerUpdate_leaderSelf',
	LEADER_OPPONENT = 'playerUpdate_leaderOpponent',
	MORALE = 'playerUpdate_morale',
	MANA = 'playerUpdate_mana',
	MULLIGANS = 'playerUpdate_mulligans',
	CARD_ADD_HAND_UNIT = 'playerUpdate_cardAddToHandUnit',
	CARD_ADD_HAND_SPELL = 'playerUpdate_cardAddToHandSpell',
	CARD_ADD_DECK_UNIT = 'playerUpdate_cardAddToDeckUnit',
	CARD_ADD_DECK_SPELL = 'playerUpdate_cardAddToDeckSpell',
	CARD_ADD_GRAVE_UNIT = 'playerUpdate_cardAddToGraveUnit',
	CARD_ADD_GRAVE_SPELL = 'playerUpdate_cardAddToGraveSpell',
	CARD_DESTROY_IN_HAND = 'playerUpdate_cardDestroyFromHand',
	CARD_DESTROY_IN_DECK = 'playerUpdate_cardDestroyFromDeck',
	CARD_DESTROY_IN_GRAVE = 'playerUpdate_cardDestroyFromGrave',
	PLAY_TARGETS = 'playerUpdate_playTargets',
	UNIT_ORDERS_SELF = 'playerUpdate_unitOrdersSelf',
	UNIT_ORDERS_OPPONENT = 'playerUpdate_unitOrdersOpponent',
	CARD_REVEALED = 'playerUpdate_cardRevealed',
	PLAY_DECLINED = 'playerUpdate_playDeclined',
	TURN_START = 'playerUpdate_turnStart',
	TURN_END = 'playerUpdate_turnEnd',
	ROUND_START = 'playerUpdate_roundStart',
	ROUND_END = 'playerUpdate_roundEnd',
	GAME_END_VICTORY = 'playerUpdate_gameEndAsVictory',
	GAME_END_DEFEAT = 'playerUpdate_gameEndAsDefeat',
	GAME_END_DRAW = 'playerUpdate_gameEndAsDraw',
}

export enum GameLogUpdateMessageType {
	ENTRY = 'gameLogUpdate_entry',
}

export enum AnimationMessageType {
	PLAY = 'animation_play',
	THREAD_CREATE = 'animation_threadCreate',
	THREAD_START = 'animation_threadStart',
	THREAD_COMMIT = 'animation_threadCommit',
	EXECUTE_QUEUE = 'animation_executeQueue',
}

export enum GameSyncMessageType {
	START = 'gameSync_start',
	PHASE_ADVANCE = 'gameSync_phaseAdvance',
	PLAYER_SELF = 'gameSync_playerSelf',
	PLAYER_OPPONENT = 'gameSync_playerOpponent',
	BOARD_STATE = 'gameSync_boardState',
	STACK_STATE = 'gameSync_stackState',
	ACTIVE_PLAYER = 'gameSync_activePlayer',
}

export enum SystemMessageType {
	MODE_SPECTATE = 'system_modeSpectate',
	REQUEST_INIT = 'system_requestInit',
	ERROR_GENERIC = 'system_errorGeneric',
	COMMAND_DISCONNECT = 'system_commandDisconnect',
}

export enum BoardUpdateMessageType {
	UNIT_CREATE = 'boardUpdate_unitCreate',
	UNIT_INSERT = 'boardUpdate_unitInsert',
	UNIT_MOVE = 'boardUpdate_unitMove',
	UNIT_DESTROY = 'boardUpdate_unitDestroy',
	ROW_OWNER = 'boardUpdate_rowOwner',
}

export enum ResolveStackMessageType {
	ADD = 'resolveStack_add',
	REMOVE = 'resolveStack_remove',
}

export enum TargetingMessageType {
	CARD_PLAY = 'targeting_cardPlay',
	ANONYMOUS = 'targeting_anonymous',
}

export enum CardUpdateMessageType {
	STATS = 'cardUpdate_stats',
	VARIABLES = 'cardUpdate_variables',
	BUFF_ADD = 'cardUpdate_buffAdd',
	BUFF_DURATION = 'cardUpdate_buffDuration',
	BUFF_REMOVE = 'cardUpdate_buffRemove',
}

export type ServerToClientMessageTypes =
	| PlayerUpdateMessageType
	| GameLogUpdateMessageType
	| AnimationMessageType
	| GameSyncMessageType
	| SystemMessageType
	| BoardUpdateMessageType
	| ResolveStackMessageType
	| TargetingMessageType
	| CardUpdateMessageType
