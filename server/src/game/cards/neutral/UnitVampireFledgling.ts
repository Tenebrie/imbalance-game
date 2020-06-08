import CardType from '@shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import TargetDefinition from '../../models/targetDefinitions/TargetDefinition'
import CardTribe from '@shared/enums/CardTribe'
import ServerUnit from '../../models/ServerUnit'
import ServerDamageInstance from '../../models/ServerDamageSource'
import TargetMode from '@shared/enums/TargetMode'
import TargetDefinitionBuilder from '../../models/targetDefinitions/TargetDefinitionBuilder'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'

export default class UnitVampireFledgling extends ServerCard {
	powerLost = 1
	powerDrained = 2

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.NEUTRAL)
		this.basePower = 8
		this.baseAttack = 1
		this.baseTribes = [CardTribe.UNDEAD, CardTribe.VAMPIRE]
		this.dynamicTextVariables = {
			powerLost: this.powerLost,
			powerDrained: this.powerDrained
		}
	}

	defineValidOrderTargets(): TargetDefinitionBuilder {
		return TargetDefinition.defaultUnitOrder(this.game)
			.actions(1)
			.allow(TargetMode.ORDER_ATTACK, TargetType.UNIT, 1)
	}

	onAfterPerformingUnitAttack(thisUnit: ServerUnit, target: ServerUnit, targetMode: TargetMode, dealtDamage: number): void {
		if (dealtDamage > 0) {
			thisUnit.heal(ServerDamageInstance.fromUnit(this.powerDrained, target))
		}
	}

	onTurnStarted(): void {
		if (this.location !== CardLocation.BOARD) {
			return
		}

		const thisUnit = this.unit
		thisUnit.dealDamage(ServerDamageInstance.fromUnit(this.powerLost, thisUnit))
	}
}
