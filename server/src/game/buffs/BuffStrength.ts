import ServerBuff from '../models/ServerBuff'
import BuffStackType from '../shared/enums/BuffStackType'
import TargetDefinitionBuilder from '../models/targetDefinitions/TargetDefinitionBuilder'
import ServerTargetDefinition from '../models/targetDefinitions/ServerTargetDefinition'
import TargetMode from '../shared/enums/TargetMode'
import TargetType from '../shared/enums/TargetType'

export default class BuffStrength extends ServerBuff {
	constructor() {
		super(BuffStackType.OVERLAY);
	}

	onCreated(): void {
		this.unit.addPower(1)
	}

	onDestroyed(): void {
		this.unit.addPower(-1)
	}
}
