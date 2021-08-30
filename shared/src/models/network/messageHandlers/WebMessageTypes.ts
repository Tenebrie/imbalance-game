import GameMessage from '../GameMessage'

export enum WebMessageType {
	GAMES_INFO = 'gamesInfo',
	GAME_CREATED = 'gameCreated',
	GAME_UPDATED = 'gameUpdated',
	GAME_DESTROYED = 'gameDestroyed',
}

export type WebMessageTypeMapping = {
	[WebMessageType.GAMES_INFO]: GameMessage[]
	[WebMessageType.GAME_CREATED]: GameMessage
	[WebMessageType.GAME_UPDATED]: GameMessage
	[WebMessageType.GAME_DESTROYED]: GameMessage
}

type ServerSideTyper<T> = {
	[K in keyof T]: {
		type: K
		data: T[K]
	}
}[keyof T]
export type ServerToClientWebJson = ServerSideTyper<WebMessageTypeMapping>

type ClientSideTyper<T> = { [K in keyof T]: (data: T[K]) => void }
export type ServerToClientWebMapping = ClientSideTyper<WebMessageTypeMapping>
