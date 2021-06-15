import ServerPlayer from '../players/ServerPlayer'
import AccessLevel from '@shared/enums/AccessLevel'
import { createBotPlayerId } from '@src/utils/Utils'

export default class ServerBotPlayer extends ServerPlayer {
	constructor() {
		super(createBotPlayerId(), 'bot@tenebrie.com', 'AI', AccessLevel.NORMAL, false)
	}

	sendMessage(): void {
		return
	}
}
