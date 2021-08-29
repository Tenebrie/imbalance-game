import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'

import Keywords from '../../../../utils/Keywords'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitCleansingFlame extends ServerCard {
	dispelPower = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.ELEMENTAL],
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_DISPEL_X],
			stats: {
				power: 12,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			dispelPower: this.dispelPower,
		}

		this.createDeployTargets(TargetType.UNIT)
			.requireNotSelf()
			.require(({ targetCard }) => targetCard.buffs.dispellable.length > 0)

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT).perform(({ targetCard }) => {
			Keywords.dispel(this.dispelPower).from(targetCard).withSourceAs(this)
		})
	}
}
