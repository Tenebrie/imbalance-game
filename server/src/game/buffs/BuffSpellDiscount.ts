import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import BuffFeature from '@shared/enums/BuffFeature'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffSpellDiscount extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.ADD_INTENSITY)
		this.alignment = BuffAlignment.POSITIVE
		this.buffFeatures = [BuffFeature.SPELL_DISCOUNT_PER_INTENSITY]
	}

	getSpellCostOverride(baseCost: number): number {
		return baseCost - this.intensity
	}
}
