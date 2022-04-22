import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffGwentRowFrost from '@src/game/buffs/14-gwent/BuffGwentRowFrost'
import BuffStrength from '@src/game/buffs/BuffStrength'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentWildHuntWarrior extends ServerCard {
	public static readonly DAMAGE = 3
	public static readonly SELF_BOOST = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.WILD_HUNT, CardTribe.SOLDIER],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: GwentWildHuntWarrior.DAMAGE,
			selfBoost: GwentWildHuntWarrior.SELF_BOOST,
		}

		this.createLocalization({
			en: {
				name: 'Wild Hunt Warrior',
				description: 'Deal {damage} damage to an enemy. If the enemy is destroyed or is under *Biting Frost*, boost self by {selfBoost}.',
				flavor: 'The White Frost is coming.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				const isUnderFrost = game.board.rows[targetUnit.rowIndex].buffs.has(BuffGwentRowFrost)
				targetUnit.dealDamage(DamageInstance.fromCard(GwentWildHuntWarrior.DAMAGE, this))
				if (targetUnit.isDead || isUnderFrost) {
					this.buffs.addMultiple(BuffStrength, GwentWildHuntWarrior.SELF_BOOST, this)
				}
			})
	}
}
