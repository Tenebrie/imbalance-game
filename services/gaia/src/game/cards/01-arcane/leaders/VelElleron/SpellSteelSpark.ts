import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import { CardTargetValidatorArguments } from '@src/types/TargetValidatorArguments'
import { asDirectSparkDamage, asSplashSparkDamage } from '@src/utils/LeaderStats'

import ServerCard from '../../../../models/ServerCard'
import { DamageInstance } from '../../../../models/ServerDamageSource'
import ServerGame from '../../../../models/ServerGame'
import ServerUnit from '../../../../models/ServerUnit'

export default class SpellSteelSpark extends ServerCard {
	baseDamage = asDirectSparkDamage(4)
	baseSideDamage = asSplashSparkDamage(1)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.SPARK],
			features: [CardFeature.HERO_POWER],
			stats: {
				cost: 2,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damage: this.baseDamage,
			sideDamage: this.baseSideDamage,
		}

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.evaluate((args) => this.evaluateTarget(args))
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		const sideTargets = this.game.board.getAdjacentUnits(target).filter((unit) => unit.rowIndex === target.rowIndex)

		target.dealDamage(DamageInstance.fromCard(this.baseDamage, this))

		const survivingSideTargets = sideTargets.filter((target) => target.isAlive())
		survivingSideTargets.forEach((sideTarget) => {
			this.game.animation.createInstantAnimationThread()
			sideTarget.dealDamage(DamageInstance.fromCard(this.baseSideDamage, this))
			this.game.animation.commitAnimationThread()
		})
	}

	private evaluateTarget(args: CardTargetValidatorArguments): number {
		const target = args.targetCard
		const adjacentUnits = this.game.board.getAdjacentUnits(target.unit)
		let expectedValue = Math.min(target.stats.power, this.baseDamage(this))
		adjacentUnits.forEach((unit) => (expectedValue += Math.min(unit.card.stats.power, this.baseSideDamage(this))))
		return expectedValue
	}
}
