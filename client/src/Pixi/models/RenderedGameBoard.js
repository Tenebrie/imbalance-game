import Constants from '@/shared/Constants';
import GameBoard from '@/shared/models/GameBoard';
import RenderedGameBoardRow from '@/Pixi/models/RenderedGameBoardRow';
export default class RenderedGameBoard extends GameBoard {
    constructor() {
        super();
        this.isInverted = false;
        this.rows = [];
        this.queuedAttacks = [];
        for (let i = 0; i < Constants.GAME_BOARD_ROW_COUNT; i++) {
            this.rows.push(new RenderedGameBoardRow());
        }
    }
    insertCard(card, rowIndex, unitIndex) {
        this.rows[rowIndex].insertCard(card, unitIndex);
    }
    findCardById(cardId) {
        const cards = this.rows.map(row => row.cards).flat();
        return cards.find(cardOnBoard => cardOnBoard.card.id === cardId) || null;
    }
    removeCardById(cardId) {
        const rowWithCard = this.rows.find(row => !!row.cards.find(cardOnBoard => cardOnBoard.card.id === cardId));
        if (!rowWithCard) {
            console.error(`No row includes card ${cardId}`);
            return;
        }
        rowWithCard.removeCardById(cardId);
    }
    getAllCards() {
        return this.rows.map(row => row.cards).flat();
    }
    clearBoard() {
        this.rows.forEach(row => row.clearRow());
    }
    updateQueuedAttacks(newAttacks, removedAttacks) {
        removedAttacks.forEach(queuedAttack => {
            queuedAttack.destroy();
        });
        this.queuedAttacks = this.queuedAttacks.filter(queuedAttack => !removedAttacks.includes(queuedAttack));
        this.queuedAttacks = this.queuedAttacks.concat(newAttacks);
    }
    setInverted(isInverted) {
        this.isInverted = isInverted;
    }
}
//# sourceMappingURL=RenderedGameBoard.js.map