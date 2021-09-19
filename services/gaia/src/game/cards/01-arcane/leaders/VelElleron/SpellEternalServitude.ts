import BuffDuration from '@shared/enums/BuffDuration'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import Keywords from '@src/utils/Keywords'

import BuffLeaderPower from '../../../../buffs/BuffLeaderPower'
import BuffUnitToSpellConversion from '../../../../buffs/BuffUnitToSpellConversion'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import ServerUnit from '../../../../models/ServerUnit'

export default class SpellEternalServitude extends ServerCard {
	public extraCost = 0

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.HERO_ARTIFACT, CardFeature.KEYWORD_HERO_POWER],
			stats: {
				cost: 7,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			extraCost: this.extraCost,
		}

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.evaluate(() => this.stats.basePower)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		target.buffs.add(BuffUnitToSpellConversion, this, BuffDuration.INFINITY)
		target.buffs.add(BuffLeaderPower, this, BuffDuration.INFINITY)
		Keywords.destroy.unit(target).withSource(this)
	}
}
