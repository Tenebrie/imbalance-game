import ServerCardOnBoard from '../../libraries/game/ServerCardOnBoard'

export default class QueuedCardAttack {
	attacker: ServerCardOnBoard
	target: ServerCardOnBoard

	constructor(attacker: ServerCardOnBoard, target: ServerCardOnBoard) {
		this.attacker = attacker
		this.target = target
	}
}
