import BuffDuration from '@shared/enums/BuffDuration'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import { asDirectUnitDamage, asDirectBuffPotency } from '@src/utils/LeaderStats'

import BuffStrength from '../../../buffs/BuffStrength'
import ServerCard from '../../../models/ServerCard'
import { DamageInstance } from '../../../models/ServerDamageSource'
import ServerGame from '../../../models/ServerGame'

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
		})
		this.dynamicTextVariables = {
			damage: this.damage,
			powerBuff: this.powerBuff,
		}

		this.createDeployTargets(TargetType.UNIT)
			.perform(({ targetUnit }) => {
				if(targetUnit.owner === this.ownerGroup) {
					targetUnit.buffs.addMultiple(BuffStrength, this.powerBuff, this, BuffDuration.INFINITY)
				} else {
					targetUnit.dealDamage(DamageInstance.fromCard(this.damage, this))
				}
			})
	}
}
