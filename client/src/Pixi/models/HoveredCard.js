import { CardLocation } from '@/Pixi/enums/CardLocation';
export default class HoveredCard {
    constructor(card, location, owner) {
        this.card = card;
        this.location = location;
        this.owner = owner;
    }
    static fromCardInHand(card, owner) {
        return new HoveredCard(card, CardLocation.HAND, owner);
    }
    static fromCardOnBoard(cardOnBoard) {
        return new HoveredCard(cardOnBoard.card, CardLocation.BOARD, cardOnBoard.owner);
    }
}
//# sourceMappingURL=HoveredCard.js.map