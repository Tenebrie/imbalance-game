import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import Keywords from '@src/utils/Keywords'
import CardTribe from '@src/../../shared/src/enums/CardTribe'
import BuffSpellExtraCostThisRound from '@src/game/buffs/BuffSpellExtraCostThisRound'
import CardFeature from '@src/../../shared/src/enums/CardFeature'

export default class SpellRustedWand extends ServerCard {
	dispelPower = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.SALVAGE],
			features: [CardFeature.KEYWORD_DISPEL_X],
			sortPriority: 3,
			stats: {
				cost: 1,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			dispelPower: this.dispelPower,
		}

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				Keywords.dispel(this.dispelPower).from(targetUnit).withSourceAs(this)
			})
			.finalize(() => this.buffs.add(BuffSpellExtraCostThisRound, this))
	}
}
