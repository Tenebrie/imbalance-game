import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asDirectHealingPotency } from '@src/utils/LeaderStats'
import ServerDamageInstance from '@src/game/models/ServerDamageSource'
import CardTribe from '@src/../../shared/src/enums/CardTribe'
import BuffSpellExtraCostThisRound from '@src/game/buffs/BuffSpellExtraCostThisRound'

export default class SpellRustedChalice extends ServerCard {
	healPower = asDirectHealingPotency(4)

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
