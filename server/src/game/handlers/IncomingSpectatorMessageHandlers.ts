import ServerGame from '../models/ServerGame'
import {ClientToServerSpectatorMessageTypes, SystemMessageType} from '@shared/models/network/messageHandlers/ClientToServerMessageTypes'
import ServerPlayerSpectator from '../players/ServerPlayerSpectator'
import ConnectionEstablishedHandler from './ConnectionEstablishedHandler'

export type IncomingSpectatorMessageHandlerFunction = (data: any, game: ServerGame, spectator: ServerPlayerSpectator) => void

const IncomingSpectatorMessageHandlers: {[ index in ClientToServerSpectatorMessageTypes ]: IncomingSpectatorMessageHandlerFunction } = {
	[SystemMessageType.INIT]: (data: void, game: ServerGame, spectator: ServerPlayerSpectator): void => {
		if (spectator.initialized) {
			return
		}
		spectator.initialized = true
		ConnectionEstablishedHandler.onSpectatorConnected(game, spectator)
	},

	[SystemMessageType.KEEPALIVE]: (data: void, game: ServerGame, spectator: ServerPlayerSpectator): void => {
		// No action needed
	}
}

export default IncomingSpectatorMessageHandlers
