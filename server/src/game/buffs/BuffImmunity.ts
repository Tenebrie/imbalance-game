import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerDamageInstance from '../models/ServerDamageSource'
import ServerUnit from '../models/ServerUnit'

export default class BuffImmunity extends ServerBuff {
	constructor() {
		super(BuffStackType.OVERLAY);
	}

	getDamageTaken(thisUnit: ServerUnit, damage: number, damageSource: ServerDamageInstance): number {
		return 0
	}
}
