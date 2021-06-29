import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asDirectBuffPotency } from '@src/utils/LeaderStats'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffGrowth from '../../../buffs/BuffGrowth'

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
