import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import { asDirectUnitDamage } from '@src/utils/LeaderStats'

import ServerCard from '../../../models/ServerCard'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import ServerGame from '../../../models/ServerGame'

export default class TutorialUnitEagleEyeArcher extends ServerCard {
	damage = asDirectUnitDamage(3)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.PEASANT, CardTribe.SOLDIER],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 18,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damage: this.damage,
		}

		this.createLocalization({
			en: {
				name: 'Eagle Eye Archer',
				description: '*Deploy:*\nDeal {damage} Damage to an enemy unit.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.require(({ targetUnit }) => targetUnit.owner !== this.ownerGroup)
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(ServerDamageInstance.fromCard(this.damage, this))
			})
	}
}
