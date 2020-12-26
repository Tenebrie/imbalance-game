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
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asSplashSpellDamage, asDirectSpellDamage } from '../../../../../utils/LeaderStats'

export default class SpellFireball extends ServerCard {
	baseDamage = asDirectSpellDamage(4)
	baseAreaDamage = asSplashSpellDamage(2)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.HERO_POWER],
			stats: {
				cost: 6,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damage: this.baseDamage,
			areaDamage: this.baseAreaDamage,
		}

		this.createDeployEffectTargets()
			.target(TargetType.UNIT)
			.requireEnemyUnit()
			.evaluate(TargetType.UNIT, (args) => this.evaluateTarget(args))

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT).perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		const areaTargets = this.game.board.getAdjacentUnits(target)

		target.dealDamage(ServerDamageInstance.fromCard(this.baseDamage, this))

		const survivingAreaTargets = areaTargets.filter((target) => target.isAlive())
		if (survivingAreaTargets.length === 0) {
			return
		}

		survivingAreaTargets.forEach((sideTarget) => sideTarget.dealDamage(ServerDamageInstance.fromCard(this.baseAreaDamage, this)))
	}

	private evaluateTarget(args: CardTargetValidatorArguments): number {
		const target = args.targetCard
		const adjacentUnits = this.game.board.getAdjacentUnits(target.unit)
		let expectedValue = Math.min(target.stats.power, this.baseDamage(this))
		adjacentUnits.forEach((unit) => (expectedValue += Math.min(unit.card.stats.power, this.baseAreaDamage(this))))
		return expectedValue
	}
}
