import AccessLevel from '@shared/enums/AccessLevel'
import { createBotPlayerId } from '@src/utils/Utils'

import ServerPlayer from '../players/ServerPlayer'

export default class ServerBotPlayer extends ServerPlayer {
	constructor() {
		super(createBotPlayerId(), 'bot@tenebrie.com', 'AI', AccessLevel.NORMAL, false)
	}

	sendGameMessage(): void {
		return
	}

	isInGame(): boolean {
		return true
	}
}
