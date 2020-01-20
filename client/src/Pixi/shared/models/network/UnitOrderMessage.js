import UnitOrderType from '../../enums/UnitOrderType';
export default class UnitOrderMessage {
    constructor(order) {
        this.type = order.type;
        this.orderedUnitId = order.orderedUnit.card.id;
        this.targetUnitId = '';
        this.targetRowIndex = -1;
        if (this.type === UnitOrderType.ATTACK) {
            this.targetUnitId = order.targetUnit.card.id;
        }
        else if (this.type === UnitOrderType.MOVE) {
            this.targetRowIndex = order.targetRow.index;
        }
    }
}
//# sourceMappingURL=UnitOrderMessage.js.map