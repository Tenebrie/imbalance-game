import TargetingLine from '@/Pixi/models/TargetingLine';
export default class GrabbedCard {
    constructor(card, targetingMode) {
        this.card = card;
        this.targetingMode = targetingMode;
        this.targetingLine = new TargetingLine();
        this.targetingLine.create();
    }
}
//# sourceMappingURL=GrabbedCard.js.map