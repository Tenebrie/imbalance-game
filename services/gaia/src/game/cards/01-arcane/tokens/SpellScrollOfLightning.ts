import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import { asDirectSpellDamage } from '@src/utils/LeaderStats'

import ServerCard from '../../../models/ServerCard'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import ServerGame from '../../../models/ServerGame'

export default class SpellScrollOfLightning extends ServerCard {
	damage = asDirectSpellDamage(15)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.SCROLL],
			stats: {
				cost: 4,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damage: this.damage,
		}

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(ServerDamageInstance.fromCard(this.damage, this))
			})
	}
}
