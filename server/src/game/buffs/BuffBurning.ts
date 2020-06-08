import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerDamageInstance from '../models/ServerDamageSource'

export default class BuffBurning extends ServerBuff {
	burnDamage = 1

	constructor() {
		super(BuffStackType.OVERLAY)
	}

	onTurnStarted(): void {
		this.unit.dealDamage(ServerDamageInstance.fromCard(this.burnDamage, this.source))
	}
}
