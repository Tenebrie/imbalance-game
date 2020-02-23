import ServerBuff from '../models/ServerBuff'
import BuffStackType from '../shared/enums/BuffStackType'
import TargetDefinitionBuilder from '../models/targetDefinitions/TargetDefinitionBuilder'
import ServerTargetDefinition from '../models/targetDefinitions/ServerTargetDefinition'
import TargetMode from '../shared/enums/TargetMode'
import TargetType from '../shared/enums/TargetType'

export default class BuffExtraMove extends ServerBuff {
	constructor() {
		super(BuffStackType.ADD_INTENSITY);
		this.baseDuration = 1
	}

	defineValidOrderTargetsMod(): TargetDefinitionBuilder {
		return ServerTargetDefinition.none(this.game)
			.actions(this.intensity)
			.allow(TargetMode.ORDER_MOVE, TargetType.BOARD_ROW, this.intensity)
	}
}
