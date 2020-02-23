import ServerBuff from '../models/ServerBuff'
import BuffStackType from '../shared/enums/BuffStackType'

export default class BuffSparksExtraDamage extends ServerBuff {
	constructor() {
		super(BuffStackType.OVERLAY);
	}

	onCreated(): void {

	}
}
