import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import GameEventType from '@shared/enums/GameEventType'

export default class BuffVelRamineaWeave extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.OVERLAY)

		this.createCallback(GameEventType.ROUND_STARTED)
			.perform(() => this.onRoundStarted())
	}

	private onRoundStarted(): void {
		this.card.buffs.remove(BuffVelRamineaWeave)
	}
}
