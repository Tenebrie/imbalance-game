import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffSpellExtraCostThisRound from '@src/game/buffs/BuffSpellExtraCostThisRound'
import { asDirectSpellDamage } from '@src/utils/LeaderStats'

import ServerCard from '../../../../models/ServerCard'
import { DamageInstance } from '../../../../models/ServerDamageSource'
import ServerGame from '../../../../models/ServerGame'

export default class SpellRustedAxe extends ServerCard {
	baseDamage = asDirectSpellDamage(3)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.SALVAGE],
			sortPriority: 0,
			stats: {
				cost: 1,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damage: this.baseDamage,
		}

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(this.baseDamage, this))
			})
			.finalize(() => this.buffs.add(BuffSpellExtraCostThisRound, this))
	}
}
