import Core from '@/Pixi/Core';
import CardOnBoard from '@/shared/models/CardOnBoard';
import RenderedCard from '@/Pixi/models/RenderedCard';
export default class RenderedCardOnBoard extends CardOnBoard {
    constructor(card, owner) {
        super(card, owner);
        this.card = card;
        this.owner = owner;
        this.preferredAttackTarget = null;
    }
    setPower(value) {
        this.card.setPower(value);
    }
    setAttack(value) {
        this.card.setAttack(value);
    }
    static fromMessage(message) {
        const renderedCard = RenderedCard.fromMessage(message.card);
        const owner = Core.getPlayer(message.owner.id);
        return new RenderedCardOnBoard(renderedCard, owner);
    }
}
//# sourceMappingURL=RenderedCardOnBoard.js.map