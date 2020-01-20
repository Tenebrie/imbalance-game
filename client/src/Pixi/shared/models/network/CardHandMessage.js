import CardMessage from './CardMessage';
export default class CardHandMessage {
    constructor(cards) {
        this.cards = cards.map(card => CardMessage.fromCard(card));
    }
    static fromHand(cardHand) {
        return new CardHandMessage(cardHand.cards);
    }
}
//# sourceMappingURL=CardHandMessage.js.map