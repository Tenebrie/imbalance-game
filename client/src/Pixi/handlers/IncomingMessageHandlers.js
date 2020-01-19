import Core from '@/Pixi/Core';
import ClientCardDeck from '@/Pixi/models/ClientCardDeck';
import RenderedCardHand from '@/Pixi/models/RenderedCardHand';
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame';
import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard';
import RenderedAttackOrder from '@/Pixi/models/RenderedAttackOrder';
const handlers = {
    'gameState/start': (data) => {
        Core.board.setInverted(data.isBoardInverted);
    },
    'gameState/chat': (data) => {
    },
    'gameState/hand': (data) => {
        Core.player.cardHand = RenderedCardHand.fromMessage(data);
        console.info('Player hand', Core.player.cardHand);
    },
    'gameState/deck': (data) => {
        Core.player.cardDeck = ClientCardDeck.fromMessage(data);
    },
    'gameState/opponent': (data) => {
        Core.registerOpponent(ClientPlayerInGame.fromMessage(data));
    },
    'gameState/board': (data) => {
        Core.board.clearBoard();
        data.forEach(message => {
            const card = RenderedCardOnBoard.fromMessage(message);
            Core.board.insertCard(card, message.rowIndex, message.unitIndex);
        });
    },
    'gameState/board/attacks': (data) => {
        const newAttackMessages = data.filter(message => !Core.board.queuedAttacks.find(attack => attack.attacker.card.id === message.attackerId && attack.target.card.id === message.targetId));
        const removedAttacks = Core.board.queuedAttacks.filter(attack => !data.find(message => attack.attacker.card.id === message.attackerId && attack.target.card.id === message.targetId));
        const newAttacks = newAttackMessages.map(message => RenderedAttackOrder.fromMessage(message));
        Core.board.updateAttackOrders(newAttacks, removedAttacks);
    },
    'update/game/phase': (data) => {
        Core.game.setTurnPhase(data);
    },
    'update/game/time': (data) => {
        Core.game.currentTime = data.currentTime;
        Core.game.maximumTime = data.maximumTime;
    },
    'update/board/cardCreated': (data) => {
        const card = RenderedCardOnBoard.fromMessage(data);
        Core.board.insertCard(card, data.rowIndex, data.unitIndex);
    },
    'update/board/cardDestroyed': (data) => {
        console.info('Unit destroyed', data.id);
        Core.board.removeCardById(data.id);
    },
    'update/board/card/power': (data) => {
        const cardOnBoard = Core.board.findCardById(data.id);
        if (!cardOnBoard) {
            return;
        }
        cardOnBoard.setPower(data.power);
    },
    'update/board/card/attack': (data) => {
        const cardOnBoard = Core.board.findCardById(data.id);
        if (!cardOnBoard) {
            return;
        }
        cardOnBoard.setAttack(data.attack);
    },
    'update/player/self/timeUnits': (data) => {
        Core.player.timeUnits = data.timeUnits;
    },
    'update/player/opponent/timeUnits': (data) => {
        Core.opponent.timeUnits = data.timeUnits;
    },
    'update/player/self/hand/cardDrawn': (data) => {
        console.info('Cards drawn', data);
        data.forEach(cardMessage => {
            const card = Core.player.cardDeck.drawCardById(cardMessage.id);
            if (card) {
                Core.player.cardHand.addCard(card);
            }
        });
    },
    'update/player/opponent/hand/cardDrawn': (data) => {
        data.forEach(cardMessage => {
            const card = Core.opponent.cardDeck.drawCardById(cardMessage.id);
            if (card) {
                Core.opponent.cardHand.addCard(card);
            }
        });
    },
    'update/player/opponent/hand/cardRevealed': (data) => {
        const card = Core.opponent.cardHand.getCardById(data.id);
        if (card) {
            card.reveal(data.cardType, data.cardClass);
        }
    },
    'update/player/self/hand/cardDestroyed': (data) => {
        Core.player.cardHand.removeCardById(data.id);
    },
    'update/player/opponent/hand/cardDestroyed': (data) => {
        Core.opponent.cardHand.removeCardById(data.id);
    }
};
export default handlers;
//# sourceMappingURL=IncomingMessageHandlers.js.map