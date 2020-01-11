import CardOnBoardMessage from '../CardOnBoardMessage'

export default class QueuedCardAttackMessage {
	attacker: CardOnBoardMessage
	target: CardOnBoardMessage

	constructor(attacker: CardOnBoardMessage, target: CardOnBoardMessage) {
		this.attacker = attacker
		this.target = target
	}

	public static fromCardsOnBoard(attacker: CardOnBoardMessage, target: CardOnBoardMessage): QueuedCardAttackMessage {
		return new QueuedCardAttackMessage(attacker, target)
	}
}
