import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import { DamageInstance } from '@src/game/models/ServerDamageSource'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentDwarvenSkirmisher extends ServerCard {
	public static readonly DAMAGE = 3
	public static readonly BOOST = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.DWARF],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: GwentDwarvenSkirmisher.DAMAGE,
			boost: GwentDwarvenSkirmisher.BOOST,
		}

		this.createLocalization({
			en: {
				name: 'Dwarven Skirmisher',
				description: 'Deal {damage} damage to an enemy. If the unit was not destroyed, boost self by {boost}.',
				flavor: "Worked a pickaxe all me life. Battleaxe won't be any trouble.",
			},
		})
		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(GwentDwarvenSkirmisher.DAMAGE, this))
				if (targetUnit.card.stats.power - GwentDwarvenSkirmisher.DAMAGE > 0) {
					this.buffs.addMultiple(BuffStrength, GwentDwarvenSkirmisher.BOOST, this)
				}
			})
	}
}
