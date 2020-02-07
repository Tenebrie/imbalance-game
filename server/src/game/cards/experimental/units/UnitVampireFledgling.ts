import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerTargetDefinition from '../../../models/targetDefinitions/ServerTargetDefinition'
import TargetValidatorArguments from '../../../../types/TargetValidatorArguments'
import CardTribe from '../../../shared/enums/CardTribe'
import TribeUtils from '../../../../utils/TribeUtils'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import TargetMode from '../../../shared/enums/TargetMode'
import TargetType from '../../../shared/enums/TargetType'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'

export default class UnitVampireFledgling extends ServerCard {
	hasBonus: boolean = false

	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 28
		this.baseAttack = 3
		this.cardTribes = [CardTribe.UNDEAD, CardTribe.VAMPIRE]
	}

	defineValidOrderTargets(): TargetDefinitionBuilder {
		return ServerTargetDefinition.defaultUnitOrder(this.game)
			.actions(2)
			.allow(TargetMode.ORDER_DRAIN, TargetType.UNIT)
			.allowSimultaneously([TargetMode.ORDER_ATTACK, TargetType.UNIT], [TargetMode.ORDER_DRAIN, TargetType.UNIT])
			.allowSimultaneously([TargetMode.ORDER_MOVE, TargetType.BOARD_ROW], [TargetMode.ORDER_DRAIN, TargetType.UNIT])
			.validate(TargetMode.ORDER_DRAIN, TargetType.UNIT, (args: TargetValidatorArguments) => {
				const thisUnit = args.thisUnit
				const targetUnit = args.targetUnit!
				const distanceToTarget = Math.abs(thisUnit.rowIndex - targetUnit.rowIndex)
				const isLiving = TribeUtils.isLiving(targetUnit.card)
				return targetUnit !== thisUnit && distanceToTarget <= thisUnit.card.attackRange && targetUnit.owner === thisUnit.owner && isLiving
			})
	}

	onAfterPerformingUnitAttack(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard, targetMode: TargetMode): void {
		if (targetMode === TargetMode.ORDER_DRAIN) {
			thisUnit.setAttack(thisUnit.card.attack + 4)
			thisUnit.heal(ServerDamageInstance.fromUnit(3, target))
			this.hasBonus = true
		}
	}

	onTurnEnded(thisUnit: ServerCardOnBoard): void {
		if (this.hasBonus) {
			thisUnit.setAttack(thisUnit.card.attack - 4)
		}
		this.hasBonus = false
	}
}
