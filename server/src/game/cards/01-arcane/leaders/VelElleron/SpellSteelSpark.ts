import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import ServerUnit from '../../../../models/ServerUnit'
import ServerDamageInstance from '../../../../models/ServerDamageSource'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import { CardTargetValidatorArguments } from '../../../../../types/TargetValidatorArguments'
import CardTribe from '@shared/enums/CardTribe'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asSplashSpellDamage, asDirectSpellDamage } from '../../../../../utils/LeaderStats'

export default class SpellSteelSpark extends ServerCard {
	baseDamage = asDirectSpellDamage(2)
	baseSideDamage = asSplashSpellDamage(1)

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

		this.createDeployEffectTargets()
			.target(TargetType.UNIT)
			.requireEnemyUnit()
			.evaluate(TargetType.UNIT, (args) => this.evaluateTarget(args))

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT).perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		const sideTargets = this.game.board.getAdjacentUnits(target).filter((unit) => unit.rowIndex === target.rowIndex)

		target.dealDamage(ServerDamageInstance.fromCard(this.baseDamage, this))

		const survivingSideTargets = sideTargets.filter((target) => target.isAlive())
		survivingSideTargets.forEach((sideTarget) => {
			this.game.animation.createInstantAnimationThread()
			sideTarget.dealDamage(ServerDamageInstance.fromCard(this.baseSideDamage, this))
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
