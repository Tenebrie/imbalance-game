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
import Keywords from '../../../../utils/Keywords'

export default class UnitCleansingFlame extends ServerCard {
	dispelPower = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.ELEMENTAL],
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_DISPEL_X],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			dispelPower: this.dispelPower,
		}

		this.createDeployTargeting(TargetType.UNIT)
			.requireNotSelf()
			.require(({ targetCard }) => targetCard.buffs.dispellable.length > 0)

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT).perform(({ targetCard }) => {
			Keywords.dispel(this.dispelPower).from(targetCard).withSourceAs(this)
		})
	}
}
