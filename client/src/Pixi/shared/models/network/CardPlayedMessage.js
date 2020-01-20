export default class CardPlayedMessage {
    constructor(card, rowIndex, unitIndex) {
        this.id = card.id;
        this.rowIndex = rowIndex;
        this.unitIndex = unitIndex;
    }
    static fromCard(card) {
        return new CardPlayedMessage(card, 0, 0);
    }
    static fromCardOnRow(card, rowIndex, unitIndex) {
        return new CardPlayedMessage(card, rowIndex, unitIndex);
    }
}
//# sourceMappingURL=CardPlayedMessage.js.map