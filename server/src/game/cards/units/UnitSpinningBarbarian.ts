import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerCardOnBoard from '../../models/ServerCardOnBoard'
import UnitOrderType from '../../shared/enums/UnitOrderType'

export default class UnitSpinningBarbarian extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 21
		this.baseAttack = 4
	}

	getMaxOrdersOfType(thisUnit: ServerCardOnBoard, type: UnitOrderType): number {
		if (type === UnitOrderType.ATTACK) {
			return 3
		}
		return 1
	}

	getMaxOrdersTotal(thisUnit: ServerCardOnBoard): number {
		return 3
	}
}
