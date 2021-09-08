import {
	ClientToServerSpectatorSystemMessageHandler,
	SystemMessageType,
} from '@shared/models/network/messageHandlers/ClientToServerGameMessages'

import ServerGame from '../models/ServerGame'
import ServerPlayerSpectator from '../players/ServerPlayerSpectator'
import ConnectionEstablishedHandler from './ConnectionEstablishedHandler'

const IncomingSpectatorMessageHandlers: ClientToServerSpectatorSystemMessageHandler<ServerGame, ServerPlayerSpectator> = {
	[SystemMessageType.INIT]: (data: null, game: ServerGame, spectator: ServerPlayerSpectator): void => {
		if (spectator.initialized) {
			return
		}
		spectator.initialized = true
		ConnectionEstablishedHandler.onSpectatorConnected(game, spectator)
	},

	[SystemMessageType.KEEPALIVE]: (): void => {
		// No action needed
	},
}

export default IncomingSpectatorMessageHandlers
