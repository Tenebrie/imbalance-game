import ServerCardOnBoard from '../../libraries/game/ServerCardOnBoard'
import AttackOrder from '../../shared/models/AttackOrder'

export default class ServerAttackOrder extends AttackOrder {
	attacker: ServerCardOnBoard
	target: ServerCardOnBoard

	constructor(attacker: ServerCardOnBoard, target: ServerCardOnBoard) {
		super(attacker, target)
		this.attacker = attacker
		this.target = target
	}
}
