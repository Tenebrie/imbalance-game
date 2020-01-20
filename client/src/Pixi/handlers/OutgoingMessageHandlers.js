import Core from '@/Pixi/Core';
import CardPlayedMessage from '@/Pixi/shared/models/network/CardPlayedMessage';
import AttackOrderMessage from '@/Pixi/shared/models/network/AttackOrderMessage';
import MoveOrderMessage from '../shared/models/network/MoveOrderMessage';
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
    sendUnitMoveOrders(order) {
        console.log('Sending order');
        Core.sendMessage('post/moveOrder', MoveOrderMessage.fromUnitAndIndex(order.unit, order.targetRow.index));
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