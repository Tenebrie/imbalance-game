import { v4 as uuidv4 } from 'uuid'
import ServerPlayer from '../players/ServerPlayer'
import AccessLevel from '@shared/enums/AccessLevel'

export default class ServerBotPlayer extends ServerPlayer {
	constructor() {
		super(uuidv4(), 'bot@tenebrie.com', 'Bot', AccessLevel.NORMAL)
	}

	sendMessage(json: { type: string; data: any }): void {
		return
	}
}
