import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'
import { BuffConstructorParams, ServerCardBuff } from '@src/game/models/buffs/ServerBuff'
import LeaderStatType from '@shared/enums/LeaderStatType'

export default class BuffDryadWolfspeakerEffect extends ServerCardBuff {
	public static readonly BONUS_DAMAGE = 1

	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			features: [BuffFeature.SKIP_ANIMATION],
		})
		this.createLeaderStatOverride(LeaderStatType.DIRECT_UNIT_DAMAGE).add(1)
	}
}
