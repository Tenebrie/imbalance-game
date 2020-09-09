import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import SimpleTargetDefinitionBuilder from '../../../../models/targetDefinitions/SimpleTargetDefinitionBuilder'
import TargetDefinitionBuilder from '../../../../models/targetDefinitions/TargetDefinitionBuilder'
import ServerUnit from '../../../../models/ServerUnit'
import ServerDamageInstance from '../../../../models/ServerDamageSource'
import CardColor from '@shared/enums/CardColor'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import {CardTargetSelectedEventArgs} from '../../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import TargetValidatorArguments from '../../../../../types/TargetValidatorArguments'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class SpellFireball extends ServerCard {
	baseDamage = 4
	baseAreaDamage = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.HERO_POWER],
			stats: {
				cost: 6
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damage: () => this.damage,
			areaDamage: () => this.areaDamage
		}

		this.createDeployEffectTargets()
			.target(TargetType.UNIT)
			.requireEnemyUnit()
			.evaluate(TargetType.UNIT, (args => this.evaluateTarget(args)))

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	get damage(): number {
		return this.baseDamage
	}

	get areaDamage(): number {
		return this.baseAreaDamage
	}

	private onTargetSelected(target: ServerUnit): void {
		const areaTargets = this.game.board.getAdjacentUnits(target)

		target.dealDamage(ServerDamageInstance.fromCard(this.damage, this))

		const survivingAreaTargets = areaTargets.filter(target => target.isAlive())
		if (survivingAreaTargets.length === 0) {
			return
		}

		survivingAreaTargets.forEach(sideTarget => sideTarget.dealDamage(ServerDamageInstance.fromCard(this.areaDamage, this)))
	}

	private evaluateTarget(args: TargetValidatorArguments): number {
		const target = args.targetCard
		const adjacentUnits = this.game.board.getAdjacentUnits(target.unit)
		let expectedValue = Math.min(target.stats.power, this.damage)
		adjacentUnits.forEach(unit => expectedValue += Math.min(unit.card.stats.power, this.areaDamage))
		return expectedValue
	}
}
