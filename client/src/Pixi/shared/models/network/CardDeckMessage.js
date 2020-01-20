import CardDeck from '../CardDeck';
import CardMessage from './CardMessage';
export default class CardDeckMessage extends CardDeck {
    constructor(cards) {
        super(cards);
        this.cards = cards.map(card => CardMessage.fromCard(card));
    }
    static fromDeck(cardDeck) {
        return new CardDeckMessage(cardDeck.cards);
    }
}
//# sourceMappingURL=CardDeckMessage.js.map