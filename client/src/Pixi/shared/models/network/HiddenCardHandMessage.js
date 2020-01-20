import HiddenCardMessage from './HiddenCardMessage';
export default class HiddenCardHandMessage {
    constructor(cards) {
        this.cards = cards.map(card => HiddenCardMessage.fromCard(card));
    }
    static fromHand(cardHand) {
        return new HiddenCardHandMessage(cardHand.cards);
    }
}
//# sourceMappingURL=HiddenCardHandMessage.js.map