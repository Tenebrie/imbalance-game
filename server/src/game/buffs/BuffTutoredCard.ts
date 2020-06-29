import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import CardFeature from '@shared/enums/CardFeature'
import ServerGame from '../models/ServerGame'

export default class BuffTutoredCard extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.OVERLAY)
		this.cardFeatures = [CardFeature.TEMPORARY_CARD]
	}

	getUnitCostOverride(baseCost: number): number {
		return 0
	}

	getSpellCostOverride(baseCost: number): number {
		return 0
	}
}
