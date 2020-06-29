import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import TargetDefinitionBuilder from '../models/targetDefinitions/TargetDefinitionBuilder'
import TargetDefinition from '../models/targetDefinitions/TargetDefinition'
import ServerGame from '../models/ServerGame'

export default class BuffStun extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.OVERLAY)
	}

	defineValidOrderTargetsOverride(targetDefinition: TargetDefinitionBuilder): TargetDefinitionBuilder {
		return TargetDefinition.none(this.game)
	}
}
