import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import { CardTargetValidatorArguments } from '@src/types/TargetValidatorArguments'
import { asDirectSpellDamage } from '@src/utils/LeaderStats'

import ServerCard from '../../../../models/ServerCard'
import ServerDamageInstance from '../../../../models/ServerDamageSource'
import ServerGame from '../../../../models/ServerGame'

export default class SpellQuickStrike extends ServerCard {
	baseDamage = asDirectSpellDamage(3)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.HUMAN,
			features: [CardFeature.HERO_POWER],
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
			.evaluate((args) => this.evaluateTarget(args))
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(ServerDamageInstance.fromCard(this.baseDamage, this))
			})
	}

	private evaluateTarget(args: CardTargetValidatorArguments): number {
		const target = args.targetCard
		return Math.min(target.stats.power, this.baseDamage(this))
	}
}
