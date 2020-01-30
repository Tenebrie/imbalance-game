import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerCardOnBoard from '../../models/ServerCardOnBoard'
import ServerUnitOrder from '../../models/ServerUnitOrder'
import UnitOrderType from '../../shared/enums/UnitOrderType'

export default class UnitTwinBowArcher extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 14
		this.baseAttack = 7
		this.baseAttackRange = 2
	}

	isUnitOrderValid(thisUnit: ServerCardOnBoard, order: ServerUnitOrder): boolean {
		return order.type !== UnitOrderType.ATTACK
	}

	onUnitOrderDeclined(thisUnit: ServerCardOnBoard, order: ServerUnitOrder): void {
		if (order.type !== UnitOrderType.ATTACK || !thisUnit.hasAvailableActions()) { return }

		const target = order.targetUnit!
		const rowWithCard = this.game.board.getRowWithUnit(target)
		const targetUnitIndex = rowWithCard.cards.indexOf(target)
		const unitOnLeft = rowWithCard.cards[targetUnitIndex - 1]
		const unitOnRight = rowWithCard.cards[targetUnitIndex + 1]
		if (unitOnLeft) {
			this.game.board.orders.performUnitAttack(thisUnit, unitOnLeft)
		}
		if (unitOnRight) {
			this.game.board.orders.performUnitAttack(thisUnit, unitOnRight)
		}
	}
}
