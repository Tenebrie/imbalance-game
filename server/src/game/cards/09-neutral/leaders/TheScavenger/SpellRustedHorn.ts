import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardTribe from '@src/../../shared/src/enums/CardTribe'
import BuffSpellExtraCostThisRound from '@src/game/buffs/BuffSpellExtraCostThisRound'
import TargetType from '@src/../../shared/src/enums/TargetType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import { asDirectBuffPotency } from '@src/utils/LeaderStats'

export default class SpellRustedHorn extends ServerCard {
	extraPower = asDirectBuffPotency(2)

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
