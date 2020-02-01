import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerCardOnBoard from '../../models/ServerCardOnBoard'
import ServerDamageInstance from '../../models/ServerDamageSource'
import ServerGameBoardRow from '../../models/ServerGameBoardRow'
import UnitOrderType from '../../shared/enums/UnitOrderType'

export default class UnitChargingKnight extends ServerCard {
	hasDamageBonus = false

	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 26
		this.baseAttack = 4
	}

	onAfterPerformingAttack(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): void {
		if (this.hasDamageBonus) {
			target.dealDamage(ServerDamageInstance.fromUnit(this.attack, thisUnit))
		}
	}

	onAfterPerformingMove(thisUnit: ServerCardOnBoard, target: ServerGameBoardRow): void {
		this.hasDamageBonus = true
	}

	canPerformOrdersSimultaneously(thisUnit: ServerCardOnBoard, firstOrder: UnitOrderType, secondOrder: UnitOrderType): boolean {
		return firstOrder === UnitOrderType.ATTACK && secondOrder === UnitOrderType.MOVE
	}

	getBonusAttackDamage(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): number {
		if (this.hasDamageBonus) {
			return this.attack
		}
	}

	getMaxOrdersTotal(thisUnit: ServerCardOnBoard): number {
		return 2
	}
}
