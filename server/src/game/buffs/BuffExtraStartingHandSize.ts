import { BuffConstructorParams, ServerCardBuff } from '../models/buffs/ServerBuff'
import BuffAlignment from '@shared/enums/BuffAlignment'
import LeaderStatType from '@shared/enums/LeaderStatType'
import BuffFeature from '@shared/enums/BuffFeature'

export default class BuffExtraStartingHandSize extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			features: [BuffFeature.SKIP_ANIMATION],
		})

		this.createLeaderStatOverride(LeaderStatType.STARTING_HAND_SIZE).add(1)
	}
}
