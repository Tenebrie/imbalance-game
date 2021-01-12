import ServerPlayer from '../players/ServerPlayer'
import AccessLevel from '@shared/enums/AccessLevel'
import { createRandomPlayerId } from '@src/utils/Utils'

export default class ServerBotPlayer extends ServerPlayer {
	constructor() {
		super(createRandomPlayerId(), 'bot@tenebrie.com', 'AI', AccessLevel.NORMAL)
	}

	sendMessage(): void {
		return
	}
}
