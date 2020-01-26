import uuidv4 from 'uuid/v4'
import ServerPlayer from '../players/ServerPlayer'

export default class ServerBotPlayer extends ServerPlayer {
	constructor() {
		super(uuidv4(), 'Dummy')
	}

	sendMessage(json: { type: string; data: any }): void {
		return
	}
}
