import CardMessage from './CardMessage';
import PlayerMessage from './PlayerMessage';
export default class CardOnBoardMessage {
    constructor(card, owner, rowIndex, unitIndex) {
        this.card = card;
        this.owner = owner;
        this.rowIndex = rowIndex;
        this.unitIndex = unitIndex;
    }
    static fromCardOnBoard(cardOnBoard) {
        const cardMessage = CardMessage.fromCard(cardOnBoard.card);
        const ownerMessage = PlayerMessage.fromPlayer(cardOnBoard.owner.player);
        return new CardOnBoardMessage(cardMessage, ownerMessage, -1, -1);
    }
    static fromCardOnBoardWithIndex(cardOnBoard, rowIndex, unitIndex) {
        const cardMessage = CardMessage.fromCard(cardOnBoard.card);
        const ownerMessage = PlayerMessage.fromPlayer(cardOnBoard.owner.player);
        return new CardOnBoardMessage(cardMessage, ownerMessage, rowIndex, unitIndex);
    }
}
//# sourceMappingURL=CardOnBoardMessage.js.map