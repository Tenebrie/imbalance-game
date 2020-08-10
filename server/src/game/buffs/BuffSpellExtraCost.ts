import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import BuffFeature from '@shared/enums/BuffFeature'

export default class BuffSpellExtraCost extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.ADD_INTENSITY)
		this.buffFeatures = [BuffFeature.SPELL_MARKUP_PER_INTENSITY]
	}

	getSpellCostOverride(baseCost: number): number {
		return baseCost + this.intensity
	}
}
