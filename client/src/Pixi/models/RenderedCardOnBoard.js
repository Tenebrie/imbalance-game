import Core from '@/Pixi/Core';
import CardOnBoard from '@/Pixi/shared/models/CardOnBoard';
import RenderedCard from '@/Pixi/models/RenderedCard';
export default class RenderedCardOnBoard extends CardOnBoard {
    constructor(card, owner) {
        super(card, owner);
        this.card = card;
        this.owner = owner;
        this.lastOrder = null;
    }
    get rowIndex() {
        return Core.board.rows.indexOf(Core.board.getRowWithCard(this));
    }
    get unitIndex() {
        return Core.board.rows[this.rowIndex].cards.indexOf(this);
    }
    setPower(value) {
        this.card.setPower(value);
    }
    setAttack(value) {
        this.card.setAttack(value);
    }
    isTargetInRange(target) {
        return Math.abs(this.rowIndex - target.rowIndex) <= this.card.attackRange;
    }
    static fromMessage(message) {
        const renderedCard = RenderedCard.fromMessage(message.card);
        const owner = Core.getPlayer(message.owner.id);
        return new RenderedCardOnBoard(renderedCard, owner);
    }
}
//# sourceMappingURL=RenderedCardOnBoard.js.map