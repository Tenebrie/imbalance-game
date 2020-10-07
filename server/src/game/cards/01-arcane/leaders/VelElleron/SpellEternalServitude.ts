import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import ServerUnit from '../../../../models/ServerUnit'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import BuffVelElleronEncouragement from '../../../../buffs/BuffVelElleronEncouragement'
import BuffDuration from '@shared/enums/BuffDuration'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import BuffUnitToSpellConversion from '../../../../buffs/BuffUnitToSpellConversion'
import BuffLeaderPower from '../../../../buffs/BuffLeaderPower'

export default class SpellEternalServitude extends ServerCard {
	public extraCost = 0

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.HERO_ARTIFACT, CardFeature.KEYWORD_HERO_POWER],
			stats: {
				cost: 7
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			extraCost: this.extraCost
		}

		this.createDeployEffectTargets()
			.target(TargetType.UNIT)
			.requireAlliedUnit()
			.evaluate(TargetType.UNIT, () => this.stats.basePower)

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		target.buffs.add(BuffUnitToSpellConversion, this, BuffDuration.INFINITY)
		target.buffs.add(BuffLeaderPower, this, BuffDuration.INFINITY)
	}
}
