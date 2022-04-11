import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffGwentRowFrost from '@src/game/buffs/14-gwent/BuffGwentRowFrost'

import ServerCard from '../../../models/ServerCard'
import { DamageInstance } from '../../../models/ServerDamageSource'
import ServerGame from '../../../models/ServerGame'

export default class GwentIceTroll extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.OGROID],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Ice Troll',
				description: "*Duel* an enemy. If it's under *Biting Frost*, deal double damage.",
				flavor:
					'Trolls come in many varieties, with differing shapes, sizes and predilections, though always with about as much brains as a bucket of rusty nails.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				for (let i = 0; i < 100; i++) {
					const isDoubleDamage = game.board.rows[targetUnit.rowIndex].buffs.has(BuffGwentRowFrost)
					const damageMultiplier = isDoubleDamage ? 2 : 1
					targetUnit.dealDamage(DamageInstance.fromCard(this.stats.power * damageMultiplier, this))
					if (targetUnit.card.isDead) {
						break
					}

					this.dealDamage(DamageInstance.fromCard(targetUnit.card.stats.power, targetUnit.card))
					if (this.isDead) {
						break
					}
				}
			})
	}
}
