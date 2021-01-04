import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asDirectBuffPotency } from '../../../../utils/LeaderStats'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffGrowth from '../../../buffs/BuffGrowth'

export default class UnitEldergroveTender extends ServerCard {
	bonusPower = asDirectBuffPotency(3)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.WILD,
			tribes: [CardTribe.DRYAD],
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_BUFF_GROWTH],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			bonusPower: this.bonusPower,
		}

		this.createDeployTargeting(TargetType.UNIT).requireAllied().requireNotSelf()

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT).perform(({ targetUnit }) => {
			targetUnit.buffs.addMultiple(BuffStrength, this.bonusPower, this)
			targetUnit.buffs.add(BuffGrowth, this)
		})
	}
}
