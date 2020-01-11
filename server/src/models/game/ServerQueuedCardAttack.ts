import ServerCardOnBoard from '../../libraries/game/ServerCardOnBoard'

export default class ServerQueuedCardAttack {
	attacker: ServerCardOnBoard
	target: ServerCardOnBoard

	constructor(attacker: ServerCardOnBoard, target: ServerCardOnBoard) {
		this.attacker = attacker
		this.target = target
	}
}
