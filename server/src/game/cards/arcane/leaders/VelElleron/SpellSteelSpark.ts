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
import CardTribe from '@shared/enums/CardTribe'

export default class SpellSteelSpark extends ServerCard {
	baseDamage = 2
	baseSideDamage = 1

	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.GOLDEN, CardFaction.ARCANE)

		this.basePower = 2
		this.baseTribes = [CardTribe.SPARK]
		this.baseFeatures = [CardFeature.HERO_POWER]
		this.dynamicTextVariables = {
			damage: () => this.damage,
			sideDamage: () => this.sideDamage
		}

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	get damage(): number {
		return this.baseDamage
	}

	get sideDamage(): number {
		return this.baseSideDamage
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return SimpleTargetDefinitionBuilder.base(this.game, TargetMode.POST_PLAY_REQUIRED_TARGET)
			.singleTarget()
			.allow(TargetType.UNIT)
			.enemyUnit()
			.evaluate(TargetType.UNIT, (args => this.evaluateTarget(args)))
	}

	private onTargetSelected(target: ServerUnit): void {
		const sideTargets = this.game.board.getAdjacentUnits(target).filter(unit => unit.rowIndex === target.rowIndex)

		target.dealDamage(ServerDamageInstance.fromCard(this.damage, this))

		const survivingSideTargets = sideTargets.filter(target => target.isAlive())
		if (survivingSideTargets.length === 0) {
			return
		}

		survivingSideTargets.forEach(sideTarget => sideTarget.dealDamage(ServerDamageInstance.fromCard(this.sideDamage, this)))
	}

	private evaluateTarget(args: TargetValidatorArguments): number {
		const target = args.targetUnit
		const adjacentUnits = this.game.board.getAdjacentUnits(target)
		let expectedValue = Math.min(target.card.power, this.damage)
		adjacentUnits.forEach(unit => expectedValue += Math.min(unit.card.power, this.sideDamage))
		return expectedValue
	}
}
