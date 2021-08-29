import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import { asDirectBuffPotency } from '@src/utils/LeaderStats'

import BuffGrowth from '../../../buffs/BuffGrowth'
import BuffStrength from '../../../buffs/BuffStrength'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitEldergroveTender extends ServerCard {
	public static readonly BONUS_POWER = asDirectBuffPotency(3)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.WILD,
			tribes: [CardTribe.DRYAD],
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_BUFF_GROWTH],
			stats: {
				power: 12,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			bonusPower: UnitEldergroveTender.BONUS_POWER,
		}

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.requireNotSelf()
			.perform(({ targetUnit }) => {
				targetUnit.buffs.addMultiple(BuffStrength, UnitEldergroveTender.BONUS_POWER, this)
				targetUnit.buffs.add(BuffGrowth, this)
			})
	}
}
