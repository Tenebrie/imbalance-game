import AttackOrder from '../AttackOrder'

export default class AttackOrderMessage {
	attackerId: string
	targetId: string

	constructor(cardId: string, targetId: string) {
		this.attackerId = cardId
		this.targetId = targetId
	}

	static fromAttackOrder(order: AttackOrder): AttackOrderMessage {
		return new AttackOrderMessage(order.attacker.card.id, order.target.card.id)
	}
}
