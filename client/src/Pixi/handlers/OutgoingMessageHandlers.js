import Core from '@/Pixi/Core';
import CardPlayedMessage from '@/shared/models/network/CardPlayedMessage';
import CardAttackOrderMessage from '@/shared/models/network/CardAttackOrderMessage';
export default {
    sendChatMessage(message) {
        Core.sendMessage('post/chat', message);
    },
    sendUnitCardPlayed(card, gameBoardRow, unitIndex) {
        const rowIndex = Core.board.rows.indexOf(gameBoardRow);
        Core.sendMessage('post/playCard', CardPlayedMessage.fromCardOnRow(card, rowIndex, unitIndex));
    },
    sendSpellCardPlayed(card) {
        Core.sendMessage('post/playCard', CardPlayedMessage.fromCard(card));
    },
    sendUnitAttackOrder(card, target) {
        Core.sendMessage('post/attackOrder', CardAttackOrderMessage.fromCards(card, target));
    },
    sendKeepalive() {
        Core.sendMessage('system/keepalive', null);
    }
};
//# sourceMappingURL=OutgoingMessageHandlers.js.map