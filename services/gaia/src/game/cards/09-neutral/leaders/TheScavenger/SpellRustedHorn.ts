import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffSpellExtraCostThisRound from '@src/game/buffs/BuffSpellExtraCostThisRound'
import BuffStrength from '@src/game/buffs/BuffStrength'
import { asDirectBuffPotency } from '@src/utils/LeaderStats'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class SpellRustedHorn extends ServerCard {
	extraPower = asDirectBuffPotency(3)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.SALVAGE],
			sortPriority: 5,
			stats: {
				cost: 1,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			extraPower: this.extraPower,
		}

		this.createDeployTargets(TargetType.UNIT)
			.label('card.spellRustedHorn.target.label')
			.requireAllied()
			.perform(({ targetUnit }) => targetUnit.buffs.addMultiple(BuffStrength, this.extraPower, this))
			.finalize(() => this.buffs.add(BuffSpellExtraCostThisRound, this))
	}
}
