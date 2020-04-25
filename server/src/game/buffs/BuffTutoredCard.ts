import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'

export default class BuffStun extends ServerBuff {
	constructor() {
		super(BuffStackType.OVERLAY)
	}

	getUnitCostOverride(baseCost: number): number {
		return 0
	}
}
