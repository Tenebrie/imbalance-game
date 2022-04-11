import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'

import ServerCard from '../../../models/ServerCard'
import { DamageInstance } from '../../../models/ServerDamageSource'
import ServerGame from '../../../models/ServerGame'

export default class GwentWyvern extends ServerCard {
	private static DAMAGE = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.DRACONID],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: GwentWyvern.DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Wyvern',
				description: 'Deal {damage} damage to an enemy.',
				flavor: 'Imagine a cross between a winged snake and a nightmare. Wyverns are worse.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.require(({ targetUnit }) => targetUnit.owner !== this.ownerGroup)
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(GwentWyvern.DAMAGE, this))
			})
	}
}
