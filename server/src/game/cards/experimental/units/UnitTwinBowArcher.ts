import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import ServerCardTarget from '../../../models/ServerCardTarget'
import ServerTargetDefinition from '../../../models/targetDefinitions/ServerTargetDefinition'
import TargetValidatorArguments from '../../../../types/TargetValidatorArguments'
import TargetMode from '../../../shared/enums/TargetMode'
import TargetType from '../../../shared/enums/TargetType'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'

export default class UnitTwinBowArcher extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 14
		this.baseAttack = 7 // 70
		this.baseAttackRange = 2 // 30
	}

	defineValidOrderTargets(): TargetDefinitionBuilder {
		return ServerTargetDefinition.defaultUnitOrder(this.game)
			.validate(TargetMode.ORDER_ATTACK, TargetType.UNIT, (args: TargetValidatorArguments) => {
				return this.game.board.getRowWithUnit(args.targetUnit).cards.length > 1
			})
	}

	isRequireCustomOrderLogic(thisUnit: ServerCardOnBoard, order: ServerCardTarget): boolean {
		return order.targetMode === TargetMode.ORDER_ATTACK
	}

	onUnitCustomOrder(thisUnit: ServerCardOnBoard, order: ServerCardTarget): void {
		const target = order.targetUnit!
		const rowWithCard = this.game.board.getRowWithUnit(target)
		const targetUnitIndex = rowWithCard.cards.indexOf(target)
		const unitOnLeft = rowWithCard.cards[targetUnitIndex - 1]
		const unitOnRight = rowWithCard.cards[targetUnitIndex + 1]
		if (unitOnLeft) {
			this.game.board.orders.performUnitAttack(TargetMode.ORDER_ATTACK, thisUnit, unitOnLeft)
			this.game.board.orders.performedOrders.push(ServerCardTarget.unitTargetUnit(TargetMode.ORDER_ATTACK, thisUnit, unitOnLeft))
		}
		if (unitOnRight) {
			this.game.board.orders.performUnitAttack(TargetMode.ORDER_ATTACK, thisUnit, unitOnRight)
			this.game.board.orders.performedOrders.push(ServerCardTarget.unitTargetUnit(TargetMode.ORDER_ATTACK, thisUnit, unitOnRight))
		}
	}
}
