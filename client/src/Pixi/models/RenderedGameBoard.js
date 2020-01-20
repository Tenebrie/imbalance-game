import Constants from '@/Pixi/shared/Constants';
import GameBoard from '@/Pixi/shared/models/GameBoard';
import RenderedGameBoardRow from '@/Pixi/models/RenderedGameBoardRow';
export default class RenderedGameBoard extends GameBoard {
    constructor() {
        super();
        this.isInverted = false;
        this.rows = [];
        this.queuedAttacks = [];
        for (let i = 0; i < Constants.GAME_BOARD_ROW_COUNT; i++) {
            this.rows.push(new RenderedGameBoardRow(i));
        }
    }
    insertUnit(card, rowIndex, unitIndex) {
        this.rows[rowIndex].insertUnit(card, unitIndex);
    }
    removeUnit(unit) {
        this.rows[unit.rowIndex].removeUnit(unit);
    }
    findUnitById(unitId) {
        const cards = this.rows.map(row => row.cards).flat();
        return cards.find(cardOnBoard => cardOnBoard.card.id === unitId) || null;
    }
    destroyUnit(unit) {
        const currentRow = this.getRowWithCard(unit);
        if (!currentRow) {
            return;
        }
        currentRow.destroyUnit(unit);
    }
    getRowWithCard(targetUnit) {
        return this.rows.find(row => !!row.cards.find(unit => unit.card.id === targetUnit.card.id)) || null;
    }
    getAllCards() {
        return this.rows.map(row => row.cards).flat();
    }
    getCardsOwnedByPlayer(owner) {
        return this.getAllCards().filter(unit => unit.owner === owner);
    }
    clearBoard() {
        this.rows.forEach(row => row.clearRow());
    }
    updateUnitOrders(newOrders, removedOrders) {
        removedOrders.forEach(queuedAttack => {
            queuedAttack.destroy();
        });
        this.queuedAttacks = this.queuedAttacks.filter(queuedAttack => !removedOrders.includes(queuedAttack));
        this.queuedAttacks = this.queuedAttacks.concat(newOrders);
        newOrders.forEach(newAttack => {
            newAttack.attacker.preferredAttackTarget = newAttack.target;
        });
    }
    setInverted(isInverted) {
        this.isInverted = isInverted;
    }
}
//# sourceMappingURL=RenderedGameBoard.js.map