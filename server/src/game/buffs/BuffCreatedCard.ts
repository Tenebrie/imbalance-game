import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import BuffFeature from '@shared/enums/BuffFeature'
import CardFeature from '@shared/enums/CardFeature'

export default class BuffTutoredCard extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.OVERLAY)
		this.buffFeatures = [BuffFeature.CARD_CAST_FREE]
		this.cardFeatures = [CardFeature.LOW_SORT_PRIORITY, CardFeature.TEMPORARY_CARD]
	}

	getUnitCostOverride(baseCost: number): number {
		return 0
	}

	getSpellCostOverride(baseCost: number): number {
		return 0
	}
}
