import BuffDuration from '@shared/enums/BuffDuration'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import { asDirectBuffPotency, asDirectUnitDamage } from '@src/utils/LeaderStats'

import BuffStrength from '../../../buffs/BuffStrength'
import ServerCard from '../../../models/ServerCard'
import { DamageInstance } from '../../../models/ServerDamageSource'
import ServerGame from '../../../models/ServerGame'

/* Original design and implementation by Eretzu. */
export default class UnitNewYearBeast extends ServerCard {
	damage = asDirectUnitDamage(6)
	powerBuff = asDirectBuffPotency(8)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.WILD,
			tribes: [CardTribe.BEAST],
			stats: {
				power: 12,
			},
			expansionSet: ExpansionSet.BASE,
			isCommunity: true,
		})
		this.dynamicTextVariables = {
			damage: this.damage,
			powerBuff: this.powerBuff,
		}

		this.createLocalization({
			en: {
				name: 'New Year Beast',
				description:
					'*Deploy:*\nShoot a rocket to either deal {damage} Damage to an enemy unit or give {powerBuff} Power to a friendly unit.',
				flavor: 'Community card by Eretzu.',
			},
		})

		this.createDeployTargets(TargetType.UNIT).perform(({ targetUnit }) => {
			if (targetUnit.owner === this.ownerGroup) {
				targetUnit.buffs.addMultiple(BuffStrength, this.powerBuff, this, BuffDuration.INFINITY)
			} else {
				targetUnit.dealDamage(DamageInstance.fromCard(this.damage, this))
			}
		})
	}
}
