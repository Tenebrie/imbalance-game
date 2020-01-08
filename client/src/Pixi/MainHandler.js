import Core from '@/Pixi/Core';
import * as PIXI from 'pixi.js';
export default class MainHandler {
    constructor() {
        this.cards = [];
        PIXI.Ticker.shared.add(MainHandler.tick);
    }
    static tick() {
        const sortedCards = Core.player.cardHand.cards.slice().reverse();
        if (!Core.input.grabbedCard) {
            Core.input.hoveredCard = sortedCards.find(card => card.isHovered(Core.input.mousePosition)) || null;
        }
    }
    registerCard(renderedCard) {
        this.cards.push(renderedCard);
    }
    unregisterCard(targetCard) {
        this.cards = this.cards.filter(card => card !== targetCard);
    }
    static start() {
        return new MainHandler();
    }
    stop() {
        PIXI.Ticker.shared.remove(MainHandler.tick);
    }
}
//# sourceMappingURL=MainHandler.js.map