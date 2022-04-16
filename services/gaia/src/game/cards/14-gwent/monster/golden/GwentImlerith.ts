import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffGwentRowFrost from '@src/game/buffs/14-gwent/BuffGwentRowFrost'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

import GwentBitingFrost from '../../neutral/bronze/GwentBitingFrost'

export default class GwentImlerith extends ServerCard {
	public static readonly BASE_DAMAGE = 4
	public static readonly FROST_DAMAGE = 8

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.WILD_HUNT, CardTribe.OFFICER],
			stats: {
				power: 9,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentBitingFrost],
		})
		this.dynamicTextVariables = {
			baseDamage: GwentImlerith.BASE_DAMAGE,
			frostDamage: GwentImlerith.FROST_DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Imlerith',
				description: 'Deal {baseDamage} damage to an enemy. If the enemy is under *Biting Frost*, deal {frostDamage} damage instead.',
				flavor: 'Ladd nahw! Kill them! Litter the earth with their entrails!',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				const isUnderFrost = game.board.rows[targetUnit.rowIndex].buffs.has(BuffGwentRowFrost)
				const damage = isUnderFrost ? GwentImlerith.FROST_DAMAGE : GwentImlerith.BASE_DAMAGE
				targetUnit.dealDamage(DamageInstance.fromCard(damage, this))
			})
	}
}
