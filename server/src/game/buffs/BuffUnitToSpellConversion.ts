import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import BuffAlignment from '@shared/enums/BuffAlignment'
import CardFeature from '@shared/enums/CardFeature'

export default class BuffUnitToSpellConversion extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.OVERLAY)
		this.alignment = BuffAlignment.NEUTRAL
		this.cardFeatures = [CardFeature.LOW_SORT_PRIORITY]
	}

	getUnitCostOverride(): number {
		return 0
	}

	getSpellCostOverride(): number {
		return this.card.stats.basePower
	}
}
