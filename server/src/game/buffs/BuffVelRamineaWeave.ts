import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'

export default class BuffVelRamineaWeave extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.OVERLAY)
	}

	onRoundStarted(): void {
		this.card.buffs.remove(BuffVelRamineaWeave)
	}
}
