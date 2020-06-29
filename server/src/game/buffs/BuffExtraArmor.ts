import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'

export default class BuffExtraArmor extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.OVERLAY)
	}

	onCreated(): void {
		this.unit.addHealthArmor(1)
	}

	onDestroyed(): void {
		this.unit.addHealthArmor(-1)
	}
}
