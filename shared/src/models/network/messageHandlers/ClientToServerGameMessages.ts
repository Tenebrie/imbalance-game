import TargetMode from '../../../enums/TargetMode'
import NovelReplyMessage from '../../novel/NovelReplyMessage'
import AnonymousTargetMessage from '../AnonymousTargetMessage'
import CardPlayedMessage from '../CardPlayedMessage'
import CardTargetMessage from '../CardTargetMessage'

export enum GenericActionMessageType {
	CARD_PLAY = 'genericAction_cardPlay',
	UNIT_ORDER = 'genericAction_unitOrder',
	CARD_TARGET = 'genericAction_cardTarget',
	ANONYMOUS_TARGET = 'genericAction_anonymousTarget',
	CONFIRM_TARGETS = 'genericAction_confirmTargets',
	REQUEST_PLAYERS_DECK = 'genericAction_requestPlayersDeck',
	REQUEST_PLAYERS_GRAVEYARD = 'genericAction_requestPlayersGraveyard',
	REQUEST_OPPONENTS_GRAVEYARD = 'genericAction_requestOpponentsGraveyard',
	NOVEL_REPLY = 'genericAction_novelReply',
	TURN_END = 'genericAction_turnEnd',
	SURRENDER = 'genericAction_surrender',
}

export type GenericActionMessageTypeMapping = {
	[GenericActionMessageType.CARD_PLAY]: CardPlayedMessage
	[GenericActionMessageType.UNIT_ORDER]: CardTargetMessage
	[GenericActionMessageType.CARD_TARGET]: CardTargetMessage
	[GenericActionMessageType.ANONYMOUS_TARGET]: AnonymousTargetMessage
	[GenericActionMessageType.CONFIRM_TARGETS]: TargetMode
	[GenericActionMessageType.REQUEST_PLAYERS_DECK]: null
	[GenericActionMessageType.REQUEST_PLAYERS_GRAVEYARD]: null
	[GenericActionMessageType.REQUEST_OPPONENTS_GRAVEYARD]: null
	[GenericActionMessageType.NOVEL_REPLY]: NovelReplyMessage
	[GenericActionMessageType.TURN_END]: null
	[GenericActionMessageType.SURRENDER]: null
}

export enum SystemMessageType {
	INIT = 'system_init',
	KEEPALIVE = 'system_keepAlive',
}

export type SystemMessageTypeMapping = {
	[SystemMessageType.INIT]: null
	[SystemMessageType.KEEPALIVE]: null
}

export type ClientToServerSpectatorSystemMessageHandler<A, B> = ConsumerSideTyper<SystemMessageTypeMapping, A, B>

export type ClientToServerGameMessageTypes = GenericActionMessageType | SystemMessageType
export type ClientToServerMessageTypeMappers = GenericActionMessageTypeMapping & SystemMessageTypeMapping
export type ClientToServerGameMessage = ProviderSideTyper<ClientToServerMessageTypeMappers>
export type ClientToServerGameMessageHandlers<A, B> = ConsumerSideTyper<ClientToServerMessageTypeMappers, A, B>

type ConsumerSideTyper<T, A, B> = { [K in keyof T]: (data: T[K], game: A, playerInGame: B) => void }
type ProviderSideTyper<T> = {
	[K in keyof T]: {
		type: K
		data: T[K]
	}
}[keyof T] & {
	highPriority?: boolean
	ignoreWorkerThreads?: boolean
	allowBatching?: boolean
}

export type ClientToServerSpectatorMessageTypes = SystemMessageType
