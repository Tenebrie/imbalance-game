export default class MoveOrderMessage {
    constructor(unitId, targetRowIndex) {
        this.unitId = unitId;
        this.targetRowIndex = targetRowIndex;
    }
    static fromUnitAndIndex(unit, targetRowIndex) {
        return new MoveOrderMessage(unit.card.id, targetRowIndex);
    }
}
//# sourceMappingURL=MoveOrderMessage.js.map