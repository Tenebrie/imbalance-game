import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetValidatorArguments from '../../../../types/TargetValidatorArguments'
import TargetType from '@shared/enums/TargetType'
import TargetMode from '@shared/enums/TargetMode'
import ServerUnit from '../../../models/ServerUnit'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import TargetDefinition from '../../../models/targetDefinitions/TargetDefinition'
import CardColor from '@shared/enums/CardColor'

export default class HeroIgnea extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE)
		this.basePower = 7
	}

	defineValidOrderTargets(): TargetDefinitionBuilder {
		return TargetDefinition.defaultUnitOrder(this.game)
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

	getAttackDamage(thisUnit: ServerUnit, target: ServerUnit, targetMode: TargetMode, targetType: TargetType): number {
		if (targetType === TargetType.BOARD_ROW) {
			return 1
		}
		return super.getAttackDamage(thisUnit, target, targetMode, targetType)
	}
}
