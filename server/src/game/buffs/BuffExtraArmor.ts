import ServerBuff from '../models/ServerBuff'
import BuffStackType from '../shared/enums/BuffStackType'

export default class BuffExtraArmor extends ServerBuff {
	constructor() {
		super(BuffStackType.OVERLAY);
	}

	onCreated(): void {
		this.unit.addHealthArmor(1)
	}

	onDestroyed(): void {
		this.unit.addHealthArmor(-1)
	}
}
