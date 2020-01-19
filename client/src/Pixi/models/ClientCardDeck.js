import RenderedCard from '@/Pixi/models/RenderedCard';
export default class ClientCardDeck {
    constructor(cards) {
        this.cards = cards;
    }
    drawCardById(cardId) {
        const drawnCard = this.cards.find(card => card.id === cardId);
        if (!drawnCard) {
            return null;
        }
        this.cards = this.cards.filter(card => card !== drawnCard);
        return drawnCard;
    }
    static fromMessage(message) {
        const cards = message.cards.map(cardMessage => RenderedCard.fromMessage(cardMessage));
        return new ClientCardDeck(cards);
    }
}
//# sourceMappingURL=ClientCardDeck.js.map