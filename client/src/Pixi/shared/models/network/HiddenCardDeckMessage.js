import HiddenCardMessage from './HiddenCardMessage';
export default class HiddenCardDeckMessage {
    constructor(cards) {
        this.cards = cards.map(card => HiddenCardMessage.fromCard(card));
    }
    static fromDeck(cardDeck) {
        return new HiddenCardDeckMessage(cardDeck.cards);
    }
}
//# sourceMappingURL=HiddenCardDeckMessage.js.map