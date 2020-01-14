import TargetingArrow from '@/Pixi/models/TargetingArrow';
export default class GrabbedCard {
    constructor(card, targetingMode) {
        this.card = card;
        this.targetingMode = targetingMode;
        this.targetingArrow = new TargetingArrow();
    }
}
//# sourceMappingURL=GrabbedCard.js.map