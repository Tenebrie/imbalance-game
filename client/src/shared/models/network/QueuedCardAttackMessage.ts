import QueuedCardAttack from '../QueuedCardAttack'
import CardMessage from './CardMessage'

export default class QueuedCardAttackMessage {
	attacker: CardMessage
	target: CardMessage

	constructor(attacker: CardMessage, target: CardMessage) {
		this.attacker = attacker
		this.target = target
	}

	public static fromQueuedCardAttack(attack: QueuedCardAttack): QueuedCardAttackMessage {
		return new QueuedCardAttackMessage(CardMessage.fromCard(attack.attacker.card), CardMessage.fromCard(attack.target.card))
	}
}
