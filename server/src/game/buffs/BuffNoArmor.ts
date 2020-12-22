import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffNoArmor extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.OVERLAY)
		this.alignment = BuffAlignment.NEGATIVE
	}

	getMaxArmorOverride(): number {
		return 0
	}
}
