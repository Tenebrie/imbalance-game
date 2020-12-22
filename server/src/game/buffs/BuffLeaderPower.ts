import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import BuffAlignment from '@shared/enums/BuffAlignment'
import CardFeature from '@shared/enums/CardFeature'

export default class BuffLeaderPower extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.OVERLAY)
		this.alignment = BuffAlignment.POSITIVE
		this.cardFeatures = [CardFeature.HERO_POWER]
	}
}
