import GameErrorMessage from '../GameErrorMessage'
import GameMessage from '../GameMessage'

export enum WebMessageType {
	CONNECTION_CONFIRM = 'connectionConfirm',
	GAMES_INFO = 'gamesInfo',
	GAME_CREATED = 'gameCreated',
	GAME_UPDATED = 'gameUpdated',
	GAME_DESTROYED = 'gameDestroyed',
	IN_GAME_ERROR = 'inGameError',
}

export type WebMessageTypeMapping = {
	[WebMessageType.CONNECTION_CONFIRM]: null
	[WebMessageType.GAMES_INFO]: GameMessage[]
	[WebMessageType.GAME_CREATED]: GameMessage
	[WebMessageType.GAME_UPDATED]: GameMessage
	[WebMessageType.GAME_DESTROYED]: GameMessage
	[WebMessageType.IN_GAME_ERROR]: GameErrorMessage
}

export type ServerToClientGlobalMessage = ProviderSideTyper<WebMessageTypeMapping>
export type ServerToClientGlobalMessageHandlers = ConsumerSideTyper<WebMessageTypeMapping>

type ConsumerSideTyper<T> = { [K in keyof T]: (data: T[K]) => void }
type ProviderSideTyper<T> = {
	[K in keyof T]: {
		type: K
		data: T[K]
	}
}[keyof T]
