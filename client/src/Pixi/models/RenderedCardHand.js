import RenderedCard from '@/Pixi/models/RenderedCard';
export default class RenderedCardHand {
    constructor(cards) {
        this.cards = cards;
    }
    addCard(card) {
        this.cards.push(card);
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