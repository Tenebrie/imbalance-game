import Core from '@/Pixi/Core';
import CardPlayedMessage from '@/shared/models/network/CardPlayedMessage';
import AttackOrderMessage from '@/shared/models/network/AttackOrderMessage';
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
    sendUnitAttackOrders(order) {
        Core.sendMessage('post/attackOrder', AttackOrderMessage.fromAttackOrder(order));
    },
    sendEndTurn() {
        Core.sendMessage('post/endTurn', null);
    },
    sendInit() {
        Core.sendMessage('system/init', null);
    },
    sendKeepalive() {
        Core.sendMessage('system/keepalive', null);
    }
};
//# sourceMappingURL=OutgoingMessageHandlers.js.map