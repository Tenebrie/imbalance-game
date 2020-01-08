import Core from '@/Pixi/Core';
import ClientCardDeck from '@/Pixi/models/ClientCardDeck';
import RenderedCardHand from '@/Pixi/models/RenderedCardHand';
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame';
const handlers = {
    'gameState/chat': (data) => {
    },
    'gameState/hand': (data) => {
        Core.player.cardHand = RenderedCardHand.fromMessage(data);
    },
    'gameState/deck': (data) => {
        Core.player.cardDeck = ClientCardDeck.fromMessage(data);
    },
    'gameState/opponent': (data) => {
        Core.registerOpponent(ClientPlayerInGame.fromMessage(data));
    },
    'gameState/board': (data) => {
    },
    'update/cardsDrawn': (data) => {
        data.forEach(cardMessage => {
            const card = Core.player.cardDeck.drawCardById(cardMessage.id);
            if (card) {
                Core.player.cardHand.addCard(card);
            }
        });
    },
    'update/opponentCardsDrawn': (data) => {
        data.forEach(cardMessage => {
            const card = Core.opponent.cardDeck.drawCardById(cardMessage.id);
            if (card) {
                Core.opponent.cardHand.addCard(card);
            }
        });
    },
    'update/opponent/hand/cardRevealed': (data) => {
        const card = Core.opponent.cardHand.getCardById(data.id);
        if (card) {
            card.reveal(data.cardClass);
        }
    },
    'update/player/hand/cardDestroyed': (data) => {
        Core.player.cardHand.removeCardById(data.id);
    },
    'update/opponent/hand/cardDestroyed': (data) => {
        Core.opponent.cardHand.removeCardById(data.id);
    }
};
export default handlers;
//# sourceMappingURL=IncomingMessageHandlers.js.map