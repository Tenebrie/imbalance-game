import RenderedCard from '@/Pixi/models/RenderedCard';
import Utils from '@/utils/Utils';
export default class RenderedCardHand {
    constructor(cards) {
        this.cards = cards;
    }
    addCard(card) {
        this.cards.push(card);
        this.cards.sort((a, b) => {
            return a.cardType - b.cardType || (b.unitSubtype ? b.unitSubtype : 10) - (a.unitSubtype ? a.unitSubtype : 10) || b.power - a.power || Utils.hashCode(a.cardClass) - Utils.hashCode(b.cardClass);
        });
    }
    getCardById(cardId) {
        return this.cards.find(renderedCard => renderedCard.id === cardId) || null;
    }
    removeCard(card) {
        this.cards.splice(this.cards.indexOf(card), 1);
        card.unregister();
    }
    removeCardById(cardId) {
        const card = this.cards.find(card => card.id === cardId);
        if (!card) {
            return;
        }
        this.removeCard(card);
    }
    static fromMessage(message) {
        const cards = message.cards.map(cardMessage => RenderedCard.fromMessage(cardMessage));
        return new RenderedCardHand(cards);
    }
}
//# sourceMappingURL=RenderedCardHand.js.map