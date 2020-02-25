import ServerBuff from '../models/ServerBuff'
import BuffStackType from '../shared/enums/BuffStackType'
import ServerDamageInstance from '../models/ServerDamageSource'
import ServerCardOnBoard from '../models/ServerCardOnBoard'

export default class BuffImmunity extends ServerBuff {
	constructor() {
		super(BuffStackType.OVERLAY);
	}

	getDamageTaken(thisUnit: ServerCardOnBoard, damage: number, damageSource: ServerDamageInstance): number {
		return 0
	}
}
