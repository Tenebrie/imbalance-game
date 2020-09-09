import SimpleTargetDefinitionBuilder from './SimpleTargetDefinitionBuilder'
import ServerGame from '../ServerGame'
import TargetMode from '@shared/enums/TargetMode'

export default class PostPlayTargetDefinitionBuilder {
	public static base(game: ServerGame): SimpleTargetDefinitionBuilder {
		return SimpleTargetDefinitionBuilder.base(game, TargetMode.UNIT_ORDER)
	}
}
