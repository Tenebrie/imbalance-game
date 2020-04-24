import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'

export default class BuffStrength extends ServerBuff {
	constructor() {
		super(BuffStackType.OVERLAY)
	}

	onCreated(): void {
		this.unit.addPower(1)
	}

	onDestroyed(): void {
		this.unit.addPower(-1)
	}
}
