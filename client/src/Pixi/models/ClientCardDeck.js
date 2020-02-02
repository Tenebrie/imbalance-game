import RenderedCard from '@/Pixi/board/RenderedCard';
export default class ClientCardDeck {
    constructor(cards) {
        this.cards = cards;
    }
    drawCardById(cardId) {
        const drawnCardMessage = this.cards.find(card => card.id === cardId);
        if (!drawnCardMessage) {
            return null;
        }
        this.cards = this.cards.filter(card => card !== drawnCardMessage);
        return RenderedCard.fromMessage(drawnCardMessage);
    }
    static fromMessage(message) {
        return new ClientCardDeck(message.cards);
    }
}
//# sourceMappingURL=ClientCardDeck.js.map