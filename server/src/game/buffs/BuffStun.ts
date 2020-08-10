import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import CardFeature from '@shared/enums/CardFeature'

export default class BuffStun extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.OVERLAY)
		this.cardFeatures = [CardFeature.STUNNED]
	}
}
