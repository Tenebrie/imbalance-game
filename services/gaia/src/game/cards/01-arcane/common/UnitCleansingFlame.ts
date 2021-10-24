import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'

import Keywords from '../../../../utils/Keywords'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitCleansingFlame extends ServerCard {
	public static readonly DISPEL_POWER = 3
	private dispelPower = UnitCleansingFlame.DISPEL_POWER

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.ELEMENTAL],
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_DISPEL_X],
			stats: {
				power: 16,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			dispelPower: this.dispelPower,
		}

		this.createLocalization({
			en: {
				name: 'Cleansing Flame',
				description: '*Deploy:*\n *Dispel* {dispelPower} from another unit.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireNotSelf()
			.require(({ targetCard }) => targetCard.buffs.playerDispellable(this.ownerGroup).length > 0)
			.perform(({ targetCard }) => {
				Keywords.dispel(this.dispelPower).from(targetCard).withSourceAs(this)
			})
	}
}
