import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffSpellExtraCostThisRound from '@src/game/buffs/BuffSpellExtraCostThisRound'
import ServerDamageInstance from '@src/game/models/ServerDamageSource'
import { asDirectHealingPotency } from '@src/utils/LeaderStats'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class SpellRustedChalice extends ServerCard {
	healPower = asDirectHealingPotency(5)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.SALVAGE],
			sortPriority: 1,
			stats: {
				cost: 1,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			healPower: this.healPower,
		}

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.perform(({ targetUnit }) => {
				targetUnit.card.heal(ServerDamageInstance.fromCard(this.healPower, this))
			})
			.finalize(() => this.buffs.add(BuffSpellExtraCostThisRound, this))
	}
}
