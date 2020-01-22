import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerCardOnBoard from '../../models/ServerCardOnBoard'
import ServerUnitOrder from '../../models/ServerUnitOrder'
import UnitOrderType from '../../shared/enums/UnitOrderType'

export default class UnitTwinBowArcher extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 4
		this.baseAttack = 6
		this.baseAttackRange = 3
	}

	isUnitOrderValid(thisUnit: ServerCardOnBoard, order: ServerUnitOrder): boolean {
		return order.type !== UnitOrderType.ATTACK
	}

	onBeforeUnitOrderIssued(thisUnit: ServerCardOnBoard, order: ServerUnitOrder): void {
		if (order.type !== UnitOrderType.ATTACK) { return }

		const target = order.targetUnit!
		const rowWithCard = this.game.board.getRowWithUnit(target)
		const targetUnitIndex = rowWithCard.cards.indexOf(target)
		const unitOnLeft = rowWithCard.cards[targetUnitIndex - 1]
		const unitOnRight = rowWithCard.cards[targetUnitIndex + 1]
		if (unitOnLeft) {
			this.game.board.orders.addUnitOrderDirectly(ServerUnitOrder.attack(thisUnit, unitOnLeft))
		}
		if (unitOnRight) {
			this.game.board.orders.addUnitOrderDirectly(ServerUnitOrder.attack(thisUnit, unitOnRight))
		}
	}
}
