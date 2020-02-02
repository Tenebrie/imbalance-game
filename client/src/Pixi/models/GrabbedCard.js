import TargetingLine from '@/Pixi/models/TargetingLine';
import { TargetingMode } from '@/Pixi/enums/TargetingMode';
export default class GrabbedCard {
    constructor(card, targetingMode) {
        this.card = card;
        this.targetingMode = targetingMode;
        this.targetingLine = new TargetingLine();
        this.targetingLine.create();
    }
    static cardPlay(card, validTargetRows) {
        const grabbedCard = new GrabbedCard(card, TargetingMode.CARD_PLAY);
        grabbedCard.validTargetRows = validTargetRows;
        return grabbedCard;
    }
    static cardOrder(card, validTargetCards, validTargetRows) {
        const grabbedCard = new GrabbedCard(card, TargetingMode.CARD_ORDER);
        grabbedCard.validTargetCards = validTargetCards;
        grabbedCard.validTargetRows = validTargetRows;
        return grabbedCard;
    }
}
//# sourceMappingURL=GrabbedCard.js.map