export default class AttackOrderMessage {
    constructor(cardId, targetId) {
        this.attackerId = cardId;
        this.targetId = targetId;
    }
    static fromAttackOrder(order) {
        return new AttackOrderMessage(order.attacker.card.id, order.target.card.id);
    }
}
//# sourceMappingURL=AttackOrderMessage.js.map