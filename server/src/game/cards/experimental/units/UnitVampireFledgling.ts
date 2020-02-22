import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerTargetDefinition from '../../../models/targetDefinitions/ServerTargetDefinition'
import CardTribe from '../../../shared/enums/CardTribe'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import TargetMode from '../../../shared/enums/TargetMode'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import CardColor from '../../../shared/enums/CardColor'
import TargetType from '../../../shared/enums/TargetType'

export default class UnitVampireFledgling extends ServerCard {
	powerLost = 1
	powerDrained = 2

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE)
		this.basePower = 8
		this.baseAttack = 1
		this.cardTribes = [CardTribe.UNDEAD, CardTribe.VAMPIRE]
		this.cardTextVariables = {
			powerLost: this.powerLost,
			powerDrained: this.powerDrained
		}
	}

	defineValidOrderTargets(): TargetDefinitionBuilder {
		return ServerTargetDefinition.defaultUnitOrder(this.game)
			.actions(1)
			.allow(TargetMode.ORDER_ATTACK, TargetType.UNIT, 1)
	}

	onAfterPerformingUnitAttack(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard, targetMode: TargetMode, dealtDamage: number): void {
		if (dealtDamage > 0) {
			thisUnit.heal(ServerDamageInstance.fromUnit(this.powerDrained, target))
		}
	}

	onTurnStarted(thisUnit: ServerCardOnBoard): void {
		thisUnit.dealDamage(ServerDamageInstance.fromUnit(this.powerLost, thisUnit))
	}
}
