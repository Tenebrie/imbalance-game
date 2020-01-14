import Core from '@/Pixi/Core';
import Card from '@/shared/models/Card';
import CardOnBoard from '@/shared/models/CardOnBoard';
import RenderedCard from '@/Pixi/models/RenderedCard';
export default class RenderedCardOnBoard extends CardOnBoard {
    constructor(card, owner) {
        super(card, owner);
        this.card = card;
        this.owner = owner;
    }
    static fromMessage(message) {
        const card = Card.fromMessage(message.card);
        const renderedCard = RenderedCard.fromCard(card);
        const owner = Core.getPlayer(message.owner.id);
        return new RenderedCardOnBoard(renderedCard, owner);
    }
}
//# sourceMappingURL=RenderedCardOnBoard.js.map