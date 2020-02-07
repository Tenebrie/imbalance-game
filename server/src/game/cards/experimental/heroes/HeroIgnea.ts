import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetValidatorArguments from '../../../../types/TargetValidatorArguments'
import TargetType from '../../../shared/enums/TargetType'
import TargetMode from '../../../shared/enums/TargetMode'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import ServerTargetDefinition from '../../../models/targetDefinitions/ServerTargetDefinition'

export default class HeroIgnea extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 27
		this.baseAttack = 2 // 10 (with effect - 25)
		this.baseAttackRange = 3 // 50
	}

	defineValidOrderTargets(): TargetDefinitionBuilder {
		return ServerTargetDefinition.defaultUnitOrder(this.game)
			.actions(2)
			.allow(TargetMode.ORDER_ATTACK, TargetType.BOARD_ROW)
			.validate(TargetMode.ORDER_ATTACK, TargetType.BOARD_ROW, (args: TargetValidatorArguments): boolean => {
				const thisUnit = args.thisUnit
				const targetRow = args.targetRow!
				return targetRow.owner === this.game.getOpponent(thisUnit.owner) && targetRow.cards.length > 0
			})
			.allowSimultaneously([TargetMode.ORDER_ATTACK, TargetType.BOARD_ROW], [TargetMode.ORDER_ATTACK, TargetType.UNIT])
			.allowSimultaneously([TargetMode.ORDER_ATTACK, TargetType.BOARD_ROW], [TargetMode.ORDER_MOVE, TargetType.BOARD_ROW])
	}

	getAttackDamage(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard, targetMode: TargetMode, targetType: TargetType): number {
		if (targetType === TargetType.BOARD_ROW) {
			return 1
		}
		return super.getAttackDamage(thisUnit, target, targetMode, targetType)
	}
}
