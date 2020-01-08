import CardOnBoard from '@/shared/models/CardOnBoard';
export default class RenderedCardOnBoard extends CardOnBoard {
    constructor(card, owner) {
        super(card, owner);
        this.card = card;
        this.owner = owner;
    }
    static newInstance(card, owner) {
        return new RenderedCardOnBoard(card, owner);
    }
}
//# sourceMappingURL=RenderedCardOnBoard.js.map