import TargetingArrow from '@/Pixi/models/TargetingArrow';
import Core from '@/Pixi/Core';
import AttackOrder from '@/Pixi/shared/models/AttackOrder';
export default class RenderedAttackOrder extends AttackOrder {
    constructor(attacker, target) {
        super(attacker, target);
        this.attacker = attacker;
        this.target = target;
        this.targetingArrow = new TargetingArrow();
    }
    destroy() {
        this.targetingArrow.destroy();
    }
    static fromMessage(message) {
        const attacker = Core.board.findUnitById(message.attackerId);
        const target = Core.board.findUnitById(message.targetId);
        if (!attacker || !target) {
            throw new Error('One of the cards does not exist!');
        }
        return new RenderedAttackOrder(attacker, target);
    }
}
//# sourceMappingURL=RenderedAttackOrder.js.map