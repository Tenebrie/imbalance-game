import GameTurnPhase from '../../../enums/GameTurnPhase'
import StoryCharacter from '../../../enums/StoryCharacter'
import NovelCueMessage from '../../novel/NovelCueMessage'
import NovelMoveAction from '../../novel/NovelMoveAction'
import NovelResponseMessage from '../../novel/NovelResponseMessage'
import AnimationMessage from '../AnimationMessage'
import AnimationThreadStartMessage from '../AnimationThreadStartMessage'
import AnonymousTargetsMessage from '../AnonymousTargetsMessage'
import BoardMessage from '../BoardMessage'
import BoardRowMessage from '../BoardRowMessage'
import OpenCardBuffMessage from '../buffs/OpenCardBuffMessage'
import OpenRowBuffMessage from '../buffs/OpenRowBuffMessage'
import CardMessage from '../card/CardMessage'
import CardRefMessage from '../card/CardRefMessage'
import CardStatsMessage from '../cardStats/CardStatsMessage'
import CardTargetMessage from '../CardTargetMessage'
import CardVariablesMessage from '../CardVariablesMessage'
import EventLogEntryMessage from '../EventLogEntryMessage'
import GameCollapseMessageData from '../GameCollapseMessageData'
import GameLinkMessage from '../GameLinkMessage'
import GameStartMessage from '../GameStartMessage'
import BundleCardBuffMessage from '../groupWrappers/BundleCardBuffMessage'
import BundleCardBuffWithAffectMessage from '../groupWrappers/BundleCardBuffWithAffectMessage'
import BundleLoopMessage from '../groupWrappers/BundleLoopMessage'
import BundleNextThreadMessage from '../groupWrappers/BundleNextThreadMessage'
import InvalidCardTargetMessage from '../InvalidCardTargetMessage'
import MulliganCountMessage from '../MulliganCountMessage'
import OwnedCardMessage from '../ownedCard/OwnedCardMessage'
import OwnedCardRefMessage from '../ownedCard/OwnedCardRefMessage'
import PlayerGroupRefMessage from '../playerGroup/PlayerGroupRefMessage'
import PlayerGroupResourcesMessage from '../playerInGame/PlayerGroupResourcesMessage'
import PlayerInGameManaMessage from '../playerInGame/PlayerInGameManaMessage'
import PlayerInGameMessage from '../playerInGame/PlayerInGameMessage'
import PlayersInLobbyMessage from '../PlayersInLobbyMessage'
import ResolveStackMessage from '../resolveStack/ResolveStackMessage'
import ResolvingCardTargetsMessage from '../ResolvingCardTargetsMessage'
import UnitMessage from '../UnitMessage'

export enum PlayerUpdateMessageType {
	MORALE = 'pl_morale',
	MANA = 'pl_mana',
	MULLIGANS = 'pl_mulligans',
	CARD_ADD_HAND_UNIT = 'pl_addToHandUnit',
	CARD_ADD_HAND_SPELL = 'pl_addToHandSpell',
	CARD_ADD_DECK_UNIT = 'pl_addToDeckUnit',
	CARD_ADD_DECK_SPELL = 'pl_addToDeckSpell',
	CARD_ADD_GRAVE_UNIT = 'pl_addToGraveUnit',
	CARD_ADD_GRAVE_SPELL = 'pl_addToGraveSpell',
	CARD_DESTROY_IN_HAND = 'pl_destroyFromHand',
	CARD_DESTROY_IN_DECK = 'pl_destroyFromDeck',
	CARD_DESTROY_IN_GRAVE = 'pl_destroyFromGrave',
	PLAY_TARGETS = 'pl_playTargets',
	UNIT_ORDERS_SELF = 'pl_unitOrdersSelf',
	UNIT_ORDERS_OPPONENT = 'pl_unitOrdersOpponent',
	CARD_REVEALED = 'pl_cardRevealed',
	PLAY_DECLINED = 'pl_playDeclined',
	TURN_START = 'pl_turnStart',
	TURN_END = 'pl_turnEnd',
	ROUND_START = 'pl_roundStart',
	ROUND_END = 'pl_roundEnd',
	GAME_END_VICTORY = 'pl_gameEndAsVictory',
	GAME_END_DEFEAT = 'pl_gameEndAsDefeat',
	GAME_END_DRAW = 'pl_gameEndAsDraw',
	LINKED_GAME = 'pl_linkedGame',
	COMMAND_JOIN_LINKED_GAME = 'pl_commandJoinLinkedGame',
}

export type PlayerUpdateMessageTypeMapping = {
	[PlayerUpdateMessageType.MORALE]: PlayerGroupResourcesMessage
	[PlayerUpdateMessageType.MANA]: PlayerInGameManaMessage
	[PlayerUpdateMessageType.MULLIGANS]: MulliganCountMessage
	[PlayerUpdateMessageType.CARD_ADD_HAND_UNIT]: OwnedCardMessage
	[PlayerUpdateMessageType.CARD_ADD_HAND_SPELL]: OwnedCardMessage
	[PlayerUpdateMessageType.CARD_ADD_DECK_UNIT]: OwnedCardMessage
	[PlayerUpdateMessageType.CARD_ADD_DECK_SPELL]: OwnedCardMessage
	[PlayerUpdateMessageType.CARD_ADD_GRAVE_UNIT]: OwnedCardMessage
	[PlayerUpdateMessageType.CARD_ADD_GRAVE_SPELL]: OwnedCardMessage
	[PlayerUpdateMessageType.CARD_DESTROY_IN_HAND]: OwnedCardRefMessage
	[PlayerUpdateMessageType.CARD_DESTROY_IN_DECK]: OwnedCardRefMessage
	[PlayerUpdateMessageType.CARD_DESTROY_IN_GRAVE]: OwnedCardRefMessage
	[PlayerUpdateMessageType.PLAY_TARGETS]: CardTargetMessage[]
	[PlayerUpdateMessageType.UNIT_ORDERS_SELF]: CardTargetMessage[]
	[PlayerUpdateMessageType.UNIT_ORDERS_OPPONENT]: CardTargetMessage[]
	[PlayerUpdateMessageType.CARD_REVEALED]: CardMessage
	[PlayerUpdateMessageType.PLAY_DECLINED]: CardRefMessage
	[PlayerUpdateMessageType.TURN_START]: PlayerGroupRefMessage
	[PlayerUpdateMessageType.TURN_END]: PlayerGroupRefMessage
	[PlayerUpdateMessageType.ROUND_START]: PlayerGroupRefMessage
	[PlayerUpdateMessageType.ROUND_END]: PlayerGroupRefMessage
	[PlayerUpdateMessageType.GAME_END_VICTORY]: null
	[PlayerUpdateMessageType.GAME_END_DEFEAT]: null
	[PlayerUpdateMessageType.GAME_END_DRAW]: null
	[PlayerUpdateMessageType.LINKED_GAME]: GameLinkMessage
	[PlayerUpdateMessageType.COMMAND_JOIN_LINKED_GAME]: null
}

export type PlayerUpdateMessageHandlers = ConsumerSideTyper<PlayerUpdateMessageTypeMapping>

export enum GameLogUpdateMessageType {
	ENTRY = 'log_entry',
}

export type GameLogUpdateMessageTypeMapping = {
	[GameLogUpdateMessageType.ENTRY]: EventLogEntryMessage[]
}

export type GameLogUpdateMessageHandlers = ConsumerSideTyper<GameLogUpdateMessageTypeMapping>

export enum AnimationMessageType {
	PLAY = 'an_play',
	THREAD_CREATE = 'thr_create',
	THREAD_START = 'thr_start',
	THREAD_COMMIT = 'thr_commit',
	EXECUTE_QUEUE = 'an_executeQueue',
}

export type AnimationMessageTypeMapping = {
	[AnimationMessageType.PLAY]: AnimationMessage
	[AnimationMessageType.THREAD_CREATE]: AnimationThreadStartMessage
	[AnimationMessageType.THREAD_COMMIT]: null
	[AnimationMessageType.THREAD_START]: AnimationThreadStartMessage
	[AnimationMessageType.EXECUTE_QUEUE]: null
}

export type AnimationMessageHandlers = ConsumerSideTyper<AnimationMessageTypeMapping>

export enum GameSyncMessageType {
	PLAYER_SLOTS = 'gs_playerSlots',
	START = 'gs_start',
	PHASE_ADVANCE = 'gs_phaseAdvance',
	PLAYER_SELF = 'gs_playerSelf',
	PLAYER_ALLIES = 'gs_playerAllies',
	PLAYER_OPPONENTS = 'gs_playerOpponents',
	BOARD_STATE = 'gs_boardState',
	STACK_STATE = 'gs_stackState',
	ACTIVE_PLAYER = 'gs_activePlayer',
}

export type GameSyncMessageTypeMapping = {
	[GameSyncMessageType.PLAYER_SLOTS]: PlayersInLobbyMessage
	[GameSyncMessageType.START]: GameStartMessage
	[GameSyncMessageType.PHASE_ADVANCE]: GameTurnPhase
	[GameSyncMessageType.PLAYER_SELF]: PlayerInGameMessage
	[GameSyncMessageType.PLAYER_ALLIES]: PlayerInGameMessage[]
	[GameSyncMessageType.PLAYER_OPPONENTS]: PlayerInGameMessage[]
	[GameSyncMessageType.BOARD_STATE]: BoardMessage
	[GameSyncMessageType.STACK_STATE]: ResolveStackMessage
	[GameSyncMessageType.ACTIVE_PLAYER]: PlayerGroupRefMessage
}

export type GameSyncMessageHandlers = ConsumerSideTyper<GameSyncMessageTypeMapping>

export enum SystemMessageType {
	MESSAGE_ACKNOWLEDGED = 'sys_ack',
	PERFORMANCE_METRICS = 'sys_perf',
	GAME_COLLAPSED = 'sys_gameCollapse',
	MODE_SPECTATE = 'sys_modeSpectate',
	REQUEST_INIT = 'sys_requestInit',
	ERROR_GENERIC = 'sys_errorGeneric',
	COMMAND_DISCONNECT = 'sys_commandDisconnect',
}

export type SystemMessageTypeMapping = {
	[SystemMessageType.MESSAGE_ACKNOWLEDGED]: null
	[SystemMessageType.PERFORMANCE_METRICS]: number
	[SystemMessageType.GAME_COLLAPSED]: GameCollapseMessageData
	[SystemMessageType.MODE_SPECTATE]: null
	[SystemMessageType.REQUEST_INIT]: null
	[SystemMessageType.ERROR_GENERIC]: string
	[SystemMessageType.COMMAND_DISCONNECT]: { reason: string }
}

export type SystemMessageHandlers = ConsumerSideTyper<SystemMessageTypeMapping>

export enum BoardUpdateMessageType {
	UNIT_INSERT = 'bd_unitInsert',
	UNIT_MOVE = 'bd_unitMove',
	UNIT_DESTROY = 'bd_unitDestroy',
	ROW_OWNER = 'bd_rowOwner',
	ROW_BUFF_ADD = 'bd_buffAdd',
	ROW_BUFF_DURATION = 'bd_buffDuration',
	ROW_BUFF_REMOVE = 'bd_buffRemove',
}

export type BoardUpdateMessageTypeMapping = {
	[BoardUpdateMessageType.UNIT_INSERT]: UnitMessage
	[BoardUpdateMessageType.UNIT_MOVE]: UnitMessage
	[BoardUpdateMessageType.UNIT_DESTROY]: CardRefMessage
	[BoardUpdateMessageType.ROW_OWNER]: BoardRowMessage
	[BoardUpdateMessageType.ROW_BUFF_ADD]: OpenRowBuffMessage
	[BoardUpdateMessageType.ROW_BUFF_DURATION]: OpenRowBuffMessage
	[BoardUpdateMessageType.ROW_BUFF_REMOVE]: OpenRowBuffMessage
}

export type BoardUpdateMessageHandlers = ConsumerSideTyper<BoardUpdateMessageTypeMapping>

export enum ResolveStackMessageType {
	ADD = 'rs_add',
	REMOVE = 'rs_remove',
}

export type ResolveStackMessageTypeMapping = {
	[ResolveStackMessageType.ADD]: OwnedCardMessage
	[ResolveStackMessageType.REMOVE]: CardRefMessage
}

export type ResolveStackMessageHandlers = ConsumerSideTyper<ResolveStackMessageTypeMapping>

export enum TargetingMessageType {
	CARD_PLAY = 'tg_cardPlay',
	ANONYMOUS = 'tg_anonymous',
	INVALID = 'tg_invalid',
}

export type TargetingMessageTypeMapping = {
	[TargetingMessageType.CARD_PLAY]: ResolvingCardTargetsMessage
	[TargetingMessageType.ANONYMOUS]: AnonymousTargetsMessage
	[TargetingMessageType.INVALID]: InvalidCardTargetMessage
}

export type TargetingMessageHandlers = ConsumerSideTyper<TargetingMessageTypeMapping>

export enum CardUpdateMessageType {
	STATS = 'cd_stats',
	VARIABLES = 'cd_variables',
	CARD_BUFF_ADD = 'cd_buffAdd',
	CARD_BUFF_DURATION = 'cd_buffDuration',
	CARD_BUFF_REMOVE = 'cd_buffRemove',
}

export type CardUpdateMessageTypeMapping = {
	[CardUpdateMessageType.STATS]: CardStatsMessage
	[CardUpdateMessageType.VARIABLES]: CardVariablesMessage[]
	[CardUpdateMessageType.CARD_BUFF_ADD]: OpenCardBuffMessage
	[CardUpdateMessageType.CARD_BUFF_DURATION]: OpenCardBuffMessage
	[CardUpdateMessageType.CARD_BUFF_REMOVE]: OpenCardBuffMessage
}

export type CardUpdateMessageHandlers = ConsumerSideTyper<CardUpdateMessageTypeMapping>

export enum NovelMessageType {
	START = 'nvl_start',
	SAY = 'nvl_say',
	MOVE = 'nvl_move',
	CLEAR = 'nvl_clear',
	ADD_REPLY = 'nvl_reply',
	ADD_CHARACTER = 'nvl_addCharacter',
	ACTIVATE_CHARACTER = 'nvl_activateCharacter',
	REMOVE_CHARACTER = 'nvl_removeCharacter',
	CONTINUE = 'nvl_continue',
	END = 'nvl_end',
}

export type NovelMessageTypeMapping = {
	[NovelMessageType.START]: null
	[NovelMessageType.SAY]: NovelCueMessage
	[NovelMessageType.MOVE]: NovelMoveAction
	[NovelMessageType.CLEAR]: null
	[NovelMessageType.ADD_REPLY]: NovelResponseMessage
	[NovelMessageType.ADD_CHARACTER]: StoryCharacter
	[NovelMessageType.ACTIVATE_CHARACTER]: StoryCharacter | null
	[NovelMessageType.REMOVE_CHARACTER]: StoryCharacter
	[NovelMessageType.CONTINUE]: null
	[NovelMessageType.END]: null
}

export type NovelMessageHandlers = ConsumerSideTyper<NovelMessageTypeMapping>

export enum BundleMessageType {
	CARD_BUFF = 'gr_cd_buff',
	CARD_BUFF_AFFECTED = 'gr_cd_buff_affect',
	THREAD_NEXT = 'gr_thr_next',
	GENERIC_LOOP = 'gr_loop',
}

export type BundleMessageTypeMapping = {
	[BundleMessageType.CARD_BUFF]: BundleCardBuffMessage
	[BundleMessageType.CARD_BUFF_AFFECTED]: BundleCardBuffWithAffectMessage
	[BundleMessageType.THREAD_NEXT]: BundleNextThreadMessage
	[BundleMessageType.GENERIC_LOOP]: BundleLoopMessage<any>
}

export type BundleMessageHandlers = ConsumerSideTyper<BundleMessageTypeMapping>

export type ServerToClientGameMessageTypes =
	| PlayerUpdateMessageType
	| GameLogUpdateMessageType
	| AnimationMessageType
	| GameSyncMessageType
	| SystemMessageType
	| BoardUpdateMessageType
	| ResolveStackMessageType
	| TargetingMessageType
	| CardUpdateMessageType
	| NovelMessageType
	| BundleMessageType

export type ServerToClientMessageTypeMappers = PlayerUpdateMessageTypeMapping &
	GameLogUpdateMessageTypeMapping &
	AnimationMessageTypeMapping &
	GameSyncMessageTypeMapping &
	SystemMessageTypeMapping &
	BoardUpdateMessageTypeMapping &
	ResolveStackMessageTypeMapping &
	TargetingMessageTypeMapping &
	CardUpdateMessageTypeMapping &
	NovelMessageTypeMapping &
	BundleMessageTypeMapping

export type ServerToClientGameMessage = ProviderSideTyper<ServerToClientMessageTypeMappers>
export type ServerToClientGameMessageHandlers = ConsumerSideTyper<ServerToClientMessageTypeMappers>
export type ServerToClientGameMessageSelector<K extends ServerToClientGameMessageTypes> = {
	type: K
	data: ServerToClientMessageTypeMappers[K]
	skipQueue?: boolean
	allowBatching?: boolean
	ignoreWorkerThreads?: boolean
}

type ConsumerSideTyper<T> = {
	[K in keyof T]: (data: T[K], systemData: QueuedMessageSystemData) => ServerToClientGameMessageSelector<any>[] | void
}
type ProviderSideTyper<T> = {
	[K in keyof T]: {
		type: K
		data: T[K]
	}
}[keyof T] & {
	skipQueue?: boolean
	allowBatching?: boolean
	ignoreWorkerThreads?: boolean
}
export interface QueuedMessageSystemData {
	animationThreadId: string
}
