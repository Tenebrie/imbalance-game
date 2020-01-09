import * as ws from 'ws'
import ServerPlayer from '../../libraries/players/ServerPlayer'

export default {
	notifyAboutGameShutdown(player: ServerPlayer) {
		player.sendMessage({
			type: 'command/disconnect',
			data: { reason: 'ServerGame shutdown' }
		})
	},

	notifyAboutInvalidGameID(ws: ws) {
		ws.send(JSON.stringify({
			type: 'error/generic',
			data: 'Invalid game ID or player token'
		}))
	},

	notifyAboutInvalidMessageType(ws: ws) {
		ws.send(JSON.stringify({
			type: 'error/generic',
			data: 'Invalid or missing message type'
		}))
	}
}
